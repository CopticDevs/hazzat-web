import { loadSoundCloudWidget, SoundCloudWidgetFactory } from './SoundCloudWidget';

const originalSC = window.SC;
function api(): SoundCloudWidgetFactory {
    return Object.assign(jest.fn(() => ({ bind: jest.fn(), unbind: jest.fn() })), { Events: { PLAY: 'play' } });
}
const script = () => document.querySelector<HTMLScriptElement>('script[data-hazzat-soundcloud-api]')!;
beforeEach(() => { jest.useFakeTimers(); delete window.SC; });
afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); document.querySelectorAll('script[data-hazzat-soundcloud-api]').forEach(node => node.remove()); window.SC = originalSC; });

test('shares one official SDK request and resolves only after its factory is available', async () => {
    const one = loadSoundCloudWidget(); const two = loadSoundCloudWidget();
    expect(one).toBe(two);
    expect(document.querySelectorAll('script[data-hazzat-soundcloud-api]')).toHaveLength(1);
    expect(script().src).toBe('https://w.soundcloud.com/player/api.js');
    expect(script().async).toBe(true);
    const factory = api(); window.SC = { Widget: factory }; script().dispatchEvent(new Event('load'));
    await expect(one).resolves.toBe(factory);
    expect(jest.getTimerCount()).toBe(0);
    await expect(loadSoundCloudWidget()).resolves.toBe(factory);
    expect(document.querySelectorAll('script[data-hazzat-soundcloud-api]')).toHaveLength(1);
});

test.each(['error', 'load', 'timeout'])('SDK %s failure settles harmlessly and allows a later fresh mount to try', async outcome => {
    const request = loadSoundCloudWidget();
    if (outcome === 'timeout') jest.advanceTimersByTime(15000);
    else script().dispatchEvent(new Event(outcome));
    await expect(request).resolves.toBeUndefined();
    expect(script()).toBeNull(); expect(jest.getTimerCount()).toBe(0);
    const next = loadSoundCloudWidget(); script().dispatchEvent(new Event('error'));
    await expect(next).resolves.toBeUndefined();
});

test('a blocked script append cannot prevent normal iframe playback', async () => {
    const append = jest.spyOn(document.head, 'appendChild').mockImplementation(() => { throw new Error('Blocked'); });
    await expect(loadSoundCloudWidget()).resolves.toBeUndefined();
    expect(jest.getTimerCount()).toBe(0); append.mockRestore();
});
