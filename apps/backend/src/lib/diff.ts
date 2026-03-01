import type { OpenRouterModel, ModelDiff, ModelRecord } from '@openrouter-free-models/shared';

/**
 * Service for detecting changes between model lists
 */
export class DiffService {
  /**
   * Detect differences between previous and current models
   */
  detectChanges(previous: ModelRecord[], current: OpenRouterModel[]): ModelDiff {
    const previousMap = new Map(previous.map((m) => [m.id, m]));
    const currentMap = new Map(current.map((m) => [m.id, m]));

    const added: OpenRouterModel[] = [];
    const removed: OpenRouterModel[] = [];
    const modified: Array<{ old: OpenRouterModel; new: OpenRouterModel }> = [];

    // Check for new and modified models
    for (const [id, currentModel] of currentMap) {
      const previousModel = previousMap.get(id);

      if (!previousModel) {
        // New model
        added.push(currentModel);
      } else if (this.hasModelChanged(previousModel, currentModel)) {
        // Modified model
        modified.push({
          old: this.dbToModel(previousModel),
          new: currentModel,
        });
      }
    }

    // Check for removed models
    for (const [id, previousModel] of previousMap) {
      if (!currentMap.has(id)) {
        removed.push(this.dbToModel(previousModel));
      }
    }

    return { added, removed, modified };
  }

  /**
   * Check if a model has changed
   */
  private hasModelChanged(dbRecord: ModelRecord, apiModel: OpenRouterModel): boolean {
    return (
      dbRecord.name !== apiModel.name ||
      dbRecord.description !== apiModel.description ||
      dbRecord.context_length !== apiModel.context_length ||
      dbRecord.pricing_prompt !== apiModel.pricing.prompt ||
      dbRecord.pricing_completion !== apiModel.pricing.completion ||
      this.architectureToString(apiModel.architecture) !== dbRecord.architecture
    );
  }

  /**
   * Convert database record to API model format
   */
  private dbToModel(record: ModelRecord): OpenRouterModel {
    return {
      id: record.id,
      name: record.name,
      description: record.description || '',
      context_length: record.context_length,
      pricing: {
        prompt: record.pricing_prompt,
        completion: record.pricing_completion,
      },
      architecture: record.architecture ? JSON.parse(record.architecture) : undefined,
    };
  }

  /**
   * Convert architecture object to string
   */
  private architectureToString(architecture?: { modality: string; [key: string]: string | undefined }): string | null {
    return architecture ? JSON.stringify(architecture) : null;
  }
}
