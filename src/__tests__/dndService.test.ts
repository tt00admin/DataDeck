import { DnDService } from '../sidebar/components/dndService.js';
import { Clip } from '../types/index.js';

// 模拟Clip对象生成函数
function createMockClip(id: string, pinned: boolean, order: number, type: string = 'text'): Clip {
  return {
    id,
    timestamp: Date.now(),
    type: type as any,
    title: `Clip ${id}`,
    tags: [],
    source: { notebookUri: 'test-uri' },
    content: { textContent: 'test' },
    pinned,
    order,
    metadata: {}
  } as Clip;
}

describe('DnDService.reorderClips', () => {
  // 测试1: 没有pinned clips时，返回原数组
  test('should return original clips when no pinned clips exist', () => {
    const clips = [
      createMockClip('1', false, 0),
      createMockClip('2', false, 1),
    ];
    const result = DnDService.reorderClips(clips, 0, 1);
    expect(result).toBe(clips); // 应该返回原数组（没有变化）
  });

  // 测试2: 有pinned clips，有效索引，正确移动
  test('should reorder pinned clips correctly with valid indices', () => {
    const clips = [
      createMockClip('p1', true, 0),
      createMockClip('p2', true, 1),
      createMockClip('p3', true, 2),
      createMockClip('u1', false, 3),
    ];
    // 将p1（index 0）移动到index 2
    const result = DnDService.reorderClips(clips, 0, 2);
    
    // 检查pinned clips的顺序
    const pinnedResult = result.filter(c => c.pinned);
    expect(pinnedResult[0].id).toBe('p2');
    expect(pinnedResult[1].id).toBe('p3');
    expect(pinnedResult[2].id).toBe('p1');
    
    // 检查order是否更新
    expect(pinnedResult[0].order).toBe(0);
    expect(pinnedResult[1].order).toBe(1);
    expect(pinnedResult[2].order).toBe(2);
    
    // 检查unpinned clips是否保持不变
    const unpinnedResult = result.filter(c => !c.pinned);
    expect(unpinnedResult[0].id).toBe('u1');
    expect(unpinnedResult[0].order).toBe(3); // order应该保持原样
  });

  // 测试3: 无效startIndex（负数），返回原数组
  test('should return original clips when startIndex is negative', () => {
    const clips = [
      createMockClip('p1', true, 0),
      createMockClip('p2', true, 1),
    ];
    const result = DnDService.reorderClips(clips, -1, 1);
    expect(result).toBe(clips);
  });

  // 测试4: 无效endIndex（超出范围），返回原数组
  test('should return original clips when endIndex is out of range', () => {
    const clips = [
      createMockClip('p1', true, 0),
      createMockClip('p2', true, 1),
    ];
    const result = DnDService.reorderClips(clips, 0, 2); // endIndex=2超出范围（只有2个pinned clips，索引0-1）
    expect(result).toBe(clips);
  });

  // 测试5: 移动到第一个位置
  test('should move clip to first position', () => {
    const clips = [
      createMockClip('p1', true, 0),
      createMockClip('p2', true, 1),
      createMockClip('p3', true, 2),
    ];
    const result = DnDService.reorderClips(clips, 2, 0); // 将p3移动到第一个位置
    
    const pinnedResult = result.filter(c => c.pinned);
    expect(pinnedResult[0].id).toBe('p3');
    expect(pinnedResult[1].id).toBe('p1');
    expect(pinnedResult[2].id).toBe('p2');
  });

  // 测试6: 混合pinned和unpinned，确保unpinned的order不变
  test('should not modify order of unpinned clips', () => {
    const clips = [
      createMockClip('p1', true, 0),
      createMockClip('u1', false, 1),
      createMockClip('p2', true, 2),
      createMockClip('u2', false, 3),
    ];
    const originalU1Order = clips[1].order;
    const originalU2Order = clips[3].order;
    
    const result = DnDService.reorderClips(clips, 0, 1); // 移动p1到p2的位置
    
    const u1 = result.find(c => c.id === 'u1');
    const u2 = result.find(c => c.id === 'u2');
    expect(u1?.order).toBe(originalU1Order);
    expect(u2?.order).toBe(originalU2Order);
  });
});

// 注意：_reorderRecentClips是SidebarProvider的私有方法，这里暂时不测试，后续可以通过集成测试验证