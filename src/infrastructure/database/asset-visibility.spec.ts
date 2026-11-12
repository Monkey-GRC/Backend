import { countRecognizedResources, liveConnectionWhere, recognizedChildWhere, recognizedResourceWhere } from './asset-visibility';
import type { TransactionClient } from './prisma.service';

describe('visibilidad de conexiones y recursos', () => {
  it('una conexión vigente: activa, sin padre y con aprovisionamiento', () => {
    expect(liveConnectionWhere('c1')).toEqual({ organization: { companyId: 'c1' }, status: 'active', parentAssetId: null, provisionings: { some: {} } });
  });

  it('un recurso reconocido: de una clase conocida y de una región declarada o sin región', () => {
    expect(recognizedResourceWhere(['us-east-1'])).toEqual({ kind: { not: 'other' }, OR: [{ region: null }, { region: { in: ['us-east-1'] } }] });
  });

  it('un activo hijo se muestra si es vigente y su recurso es reconocido', () => {
    expect(recognizedChildWhere('a1', ['us-east-1'])).toEqual({ parentAssetId: 'a1', status: 'active', resource: { is: recognizedResourceWhere(['us-east-1']) } });
  });

  describe('contar recursos reconocidos', () => {
    const fake = (groups: { assetId: string; _count: { _all: number } }[]) => {
      const groupBy = jest.fn().mockResolvedValue(groups);
      return { tx: { assetResource: { groupBy } } as unknown as TransactionClient, groupBy };
    };

    it('una sola consulta para todas las conexiones, con la regla de cada una', async () => {
      const { tx, groupBy } = fake([{ assetId: 'a1', _count: { _all: 3 } }]);
      const out = await countRecognizedResources(tx, [
        { id: 'a1', regions: ['us-east-1'], inventoryAt: new Date() },
        { id: 'a2', regions: ['eu-west-1'], inventoryAt: new Date() },
      ]);
      expect(groupBy).toHaveBeenCalledTimes(1);
      expect(groupBy.mock.calls[0][0].where.OR).toEqual([
        { assetId: 'a1', childAsset: { is: recognizedChildWhere('a1', ['us-east-1']) } },
        { assetId: 'a2', childAsset: { is: recognizedChildWhere('a2', ['eu-west-1']) } },
      ]);
      expect([...out]).toEqual([['a1', 3], ['a2', 0]]);
    });

    it('sin descubrimiento no hay nada que contar y no se consulta', async () => {
      const { tx, groupBy } = fake([]);
      const out = await countRecognizedResources(tx, [{ id: 'a1', regions: [], inventoryAt: null }]);
      expect(groupBy).not.toHaveBeenCalled();
      expect(out.get('a1')).toBe(0);
    });
  });
});
