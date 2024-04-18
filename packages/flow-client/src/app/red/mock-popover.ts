import { createMockJquery } from './mock-jquery';

export const createMockPopover = (
    jQuery: ReturnType<typeof createMockJquery>
) => {
    const createPopover = () => {
        const response = {
            get element() {
                const div = document.createElement('div');
                return div;
            },
            setContent: function (_content: unknown) {
                return response;
            },
            open: function (_instant: unknown) {
                return response;
            },
            close: function (_instant: unknown) {
                return response;
            },
            move: function (_options: unknown) {
                return;
            },
        };
        return response;
    };
    return {
        create: createPopover,
        menu: () => ({
            options: () => undefined,
            show: () => undefined,
            hide: () => undefined,
        }),
        tooltip: () => createPopover(),
        panel: () => ({
            container: jQuery([]),
            show: () => undefined,
            hide: () => undefined,
        }),
    };
};
