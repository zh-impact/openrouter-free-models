import type {
  OpenRouterModel,
  ModelRecord,
  ModelChange,
  ModelDiff,
  ModelChangeWithDetails,
} from '@openrouter-free-models/shared';
import { CHANGE_TYPES, TABLES } from '@openrouter-free-models/shared';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Storage service for database operations
 */
export class StorageService {
  constructor(private db: D1Database) {}

  /**
   * Get all active models
   */
  async getActiveModels(): Promise<ModelRecord[]> {
    const result = await this.db
      .prepare(`SELECT * FROM ${TABLES.MODELS} WHERE is_active = 1`)
      .all<ModelRecord>();

    return result.results.map(this.normalizeRecord);
  }

  /**
   * Get model by ID
   */
  async getModelById(id: string): Promise<ModelRecord | null> {
    const result = await this.db
      .prepare(`SELECT * FROM ${TABLES.MODELS} WHERE id = ?`)
      .bind(id)
      .first<ModelRecord>();

    return result ? this.normalizeRecord(result) : null;
  }

  /**
   * Upsert a model (insert or update)
   */
  async upsertModel(model: OpenRouterModel): Promise<void> {
    const existing = await this.getModelById(model.id);
    const now = new Date().toISOString();

    const architecture = model.architecture ? JSON.stringify(model.architecture) : null;

    if (existing) {
      // Update existing model
      await this.db
        .prepare(
          `UPDATE ${TABLES.MODELS} SET
            name = ?,
            description = ?,
            context_length = ?,
            pricing_prompt = ?,
            pricing_completion = ?,
            architecture = ?,
            last_seen_at = ?
          WHERE id = ?`
        )
        .bind(
          model.name,
          model.description,
          model.context_length,
          model.pricing.prompt,
          model.pricing.completion,
          architecture,
          now,
          model.id
        )
        .run();
    } else {
      // Insert new model
      await this.db
        .prepare(
          `INSERT INTO ${TABLES.MODELS} (
            id, name, description, context_length,
            pricing_prompt, pricing_completion, architecture,
            first_seen_at, last_seen_at, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
        )
        .bind(
          model.id,
          model.name,
          model.description,
          model.context_length,
          model.pricing.prompt,
          model.pricing.completion,
          architecture,
          now,
          now
        )
        .run();
    }
  }

  /**
   * Deactivate a model (when it's removed from free tier)
   */
  async deactivateModel(modelId: string): Promise<void> {
    await this.db
      .prepare(`UPDATE ${TABLES.MODELS} SET is_active = 0 WHERE id = ?`)
      .bind(modelId)
      .run();
  }

  /**
   * Save changes detected during sync
   */
  async saveChanges(diff: ModelDiff): Promise<ModelChangeWithDetails[]> {
    const changes: ModelChangeWithDetails[] = [];
    const now = new Date().toISOString();

    // Process added models
    for (const model of diff.added) {
      await this.upsertModel(model);

      const changeId = this.generateId();
      await this.insertChange({
        id: changeId,
        model_id: model.id,
        change_type: CHANGE_TYPES.ADDED,
        detected_at: now,
        old_data: null,
        new_data: JSON.stringify(model),
      });

      changes.push({
        id: changeId,
        model_id: model.id,
        change_type: CHANGE_TYPES.ADDED,
        detected_at: now,
        old_data: null,
        new_data: JSON.stringify(model),
        model_name: model.name,
        old_model: null,
        new_model: model,
      });
    }

    // Process modified models
    for (const { old, new: newModel } of diff.modified) {
      await this.upsertModel(newModel);

      const changeId = this.generateId();
      await this.insertChange({
        id: changeId,
        model_id: newModel.id,
        change_type: CHANGE_TYPES.MODIFIED,
        detected_at: now,
        old_data: JSON.stringify(old),
        new_data: JSON.stringify(newModel),
      });

      changes.push({
        id: changeId,
        model_id: newModel.id,
        change_type: CHANGE_TYPES.MODIFIED,
        detected_at: now,
        old_data: JSON.stringify(old),
        new_data: JSON.stringify(newModel),
        model_name: newModel.name,
        old_model: old,
        new_model: newModel,
      });
    }

    // Process removed models
    for (const model of diff.removed) {
      await this.deactivateModel(model.id);

      const changeId = this.generateId();
      await this.insertChange({
        id: changeId,
        model_id: model.id,
        change_type: CHANGE_TYPES.REMOVED,
        detected_at: now,
        old_data: JSON.stringify(model),
        new_data: null,
      });

      changes.push({
        id: changeId,
        model_id: model.id,
        change_type: CHANGE_TYPES.REMOVED,
        detected_at: now,
        old_data: JSON.stringify(model),
        new_data: null,
        model_name: model.name,
        old_model: model,
        new_model: null,
      });
    }

    return changes;
  }

  /**
   * Get changes history
   */
  async getChanges(limit = 50, offset = 0): Promise<ModelChangeWithDetails[]> {
    const result = await this.db
      .prepare(
        `SELECT
          mc.*,
          m.name as model_name
        FROM ${TABLES.MODEL_CHANGES} mc
        LEFT JOIN ${TABLES.MODELS} m ON mc.model_id = m.id
        ORDER BY mc.detected_at DESC
        LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all();

    return result.results.map((row) => ({
      ...row,
      model_name: (row as any).model_name || null,
      old_model: row.old_data ? JSON.parse(String(row.old_data)) : null,
      new_model: row.new_data ? JSON.parse(String(row.new_data)) : null,
    })) as ModelChangeWithDetails[];
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<string | null> {
    const result = await this.db
      .prepare(`SELECT detected_at FROM ${TABLES.MODEL_CHANGES} ORDER BY detected_at DESC LIMIT 1`)
      .first<{ detected_at: string }>();

    return result?.detected_at ?? null;
  }

  /**
   * Insert a change record
   */
  private async insertChange(change: ModelChange): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO ${TABLES.MODEL_CHANGES} (
          id, model_id, change_type, detected_at, old_data, new_data
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(change.id, change.model_id, change.change_type, change.detected_at, change.old_data, change.new_data)
      .run();
  }

  /**
   * Normalize database record (convert is_active to boolean)
   */
  private normalizeRecord(record: any): ModelRecord {
    return {
      ...record,
      is_active: Boolean(record.is_active),
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${crypto.randomUUID()}`;
  }
}
