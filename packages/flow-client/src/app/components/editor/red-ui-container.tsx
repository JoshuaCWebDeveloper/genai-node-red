import faCssUrl from '@fortawesome/fontawesome-free/css/all.css?url';
import { useCallback, useEffect, useState } from 'react';
import root from 'react-shadow/styled-components';
import styled, { createGlobalStyle } from 'styled-components';

import environment from '../../../environment';
import jqueryUiCssUrl from '../../red/jquery-ui.css?url';
import redCssUrl from '../../red/red-style.css?url';
import redTypedInputCssUrl from '../../red/red-typed-input.css?url';
import { useAppSelector } from '../../redux/hooks';
import { selectTheme } from '../../redux/modules/builder/builder.slice';

const StyledRoot = styled(root.div)`
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    scrollbar-color: var(--color-border-light) var(--color-background-main);
    scrollbar-width: thin;
`;

const StyledRedUi = createGlobalStyle`
    .ui-icon,
    .ui-widget-content .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_444444_256x240.png');
    }

    .ui-widget-header .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_444444_256x240.png');
    }

    .ui-state-hover .ui-icon,
    .ui-state-focus .ui-icon,
    .ui-button:hover .ui-icon,
    .ui-button:focus .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_555555_256x240.png');
    }

    .ui-state-active .ui-icon,
    .ui-button:active .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_ffffff_256x240.png');
    }

    .ui-state-highlight .ui-icon,
    .ui-button .ui-state-highlight.ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_777620_256x240.png');
    }

    .ui-state-error .ui-icon,
    .ui-state-error-text .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_cc0000_256x240.png');
    }

    .ui-button .ui-icon {
        background-image: url('${environment.NODE_RED_API_ROOT}/vendor/jquery/css/base/images/ui-icons_777777_256x240.png');
    }

    .red-ui-tabs {
        background-color: transparent;

        ul {
            min-width: initial !important;

            li {
                background-color: transparent;
                border-color: var(--color-border-light);
                border-bottom-color: transparent;
                width: 23.5%;

                a.red-ui-tab-label {
                    color: var(--color-text-sharp);
                }

                .red-ui-tabs-fade {
                    background: none;
                }

                &.active {
                    background-color: var(--color-background-main);
                    border-color: var(--color-border-medium);
                    border-bottom: none;

                    a.red-ui-tab-label {
                        color: var(--color-text-sharp);
                    }

                    .red-ui-tabs-fade {
                        background: none;
                    }
                }

                &:not(.active) {
                    a.red-ui-tab-label:hover {
                        background-color: var(
                            --color-background-element-medium
                        );
                        color: var(--color-text-sharp);

                        & + .red-ui-tabs-fade {
                            background: none;
                        }
                    }
                }
            }
        }

        .red-ui-tab-link-buttons {
            background-color: transparent;

            & a {
                background-color: transparent;
                border-color: var(--color-border-medium);
                color: var(--color-text-sharp) !important;

                &:not(.disabled):not(:disabled) {
                    &:hover {
                        background-color: var(--color-background-element-light);
                        color: var(--color-text-sharp) !important;
                    }

                    &:not(.single).selected {
                        background-color: var(
                            --color-background-element-medium
                        );
                        color: var(--color-text-sharp) !important;
                    }

                    &:focus {
                        color: var(--color-text-sharp) !important;
                    }
                }
            }
        }
    }

    .red-ui-editor {
        background-color: transparent;
        color: var(--color-text-sharp);
        height: 100%;

        input[type],
        select,
        textarea,
        .red-ui-typedInput-container,
        button,
        .red-ui-button,
        button .red-ui-typedInput-option-label {
            background-color: var(--color-background-element-light);
            border-color: var(--color-border-light);
            color: var(--color-text-sharp) !important;

            &:focus,
            &.red-ui-typedInput-focus:not(.input-error) {
                background-color: var(--color-background-element-focus);
                border-color: var(--color-border-medium) !important;
            }
        }

        button,
        .red-ui-button,
        button .red-ui-typedInput-option-label {
            &:hover, :not(:disabled):not(.disabled):hover {
                background-color: var(--color-background-element-medium);
                border-color: var(--color-border-medium);
                color: var(--color-text-sharp) !important;
            }
        }

        button.red-ui-typedInput-type-select {
            border-width: 1px;
            border-style: solid;
            position: relative;

            &:before {
                background-color: var(--color-background-element-sharp);
                content: " ";
                opacity: 0.7;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            &:hover {
                background-color: var(--color-background-element-sharp);
            }
        }

        .red-ui-editableList {
            display: flex;
            flex-direction: column;

            flex: 1;
            overflow: hidden;

            .red-ui-editableList-container {
                background-color: var(--color-background-element-light);
                flex: 1;
                scrollbar-color: var(--color-background-element-medium)
                    var(--color-background-element-light);
                scrollbar-width: thin;

                &.red-ui-editableList-border {
                    border-color: var(--color-border-light);
                }

                li {
                    padding: 15px 0;
                    background-color: var(--color-background-main);
                    border-color: var(--color-border-light);
                    color: var(--color-text-sharp);
                    
                    &:first-child {
                        border-top-width: 1px;
                        border-top-style: solid;
                    }
                }

                .red-ui-editableList-item-content > div {
                    display: flex;
                    align-items: center;
                    gap: 20px;

                    input:first-child {
                        flex: 0 1 130px;
                        margin: 0;
                    }

                    input:last-child {
                        flex: 1;
                    }
                }
            }

            .red-ui-editableList-addButton {
                width: 50px;
            }
        }
    }
  
    .red-ui-typedInput-options.red-ui-editor-dialog {
        background-color: var(--color-background-element-medium);
        border-color: var(--color-border-medium);

        a {
            color: var(--color-text-sharp);

            &:focus {
                background-color: var(--color-background-element-focus);
                border-color: var(--color-border-medium);
                color: var(--color-text-sharp);
            }
            
            &:hover {
                background-color: var(--color-background-element-sharp);
                border-color: var(--color-border-sharp);
                color: var(--color-text-sharp);
            }

            
        }
    }
`;

export type RedUiContainerProps = {
    className?: string;
    children: React.ReactNode;
    [key: string]: unknown;
};

export const RedUiContainer = ({
    className = '',
    children,
    ...props
}: RedUiContainerProps) => {
    const theme = useAppSelector(selectTheme);

    const [loadedCss, setLoadedCss] = useState<{
        'jquery-ui.css': boolean;
        'red-style.css': boolean;
        'red-typed-input.css': boolean;
    }>({
        'jquery-ui.css': false,
        'red-style.css': false,
        'red-typed-input.css': false,
    });
    const [loaded, setLoaded] = useState(false);

    const handleCssOnLoad = useCallback(
        (e: React.SyntheticEvent<HTMLLinkElement>) => {
            const cssFile = new URL(e.currentTarget.href).pathname
                .split('/')
                .pop() as keyof typeof loadedCss;
            setLoadedCss(prev => ({ ...prev, [cssFile]: true }));
        },
        []
    );

    useEffect(() => {
        if (
            loaded ||
            !loadedCss['jquery-ui.css'] ||
            !loadedCss['red-style.css'] ||
            !loadedCss['red-typed-input.css']
        ) {
            return;
        }

        // set loaded
        setLoaded(true);
    }, [loaded, loadedCss]);

    useEffect(() => {
        const bridgedWindow = window as unknown as {
            REDAppBridge: {
                _trigger: (type: string, value: unknown) => void;
                _listeners: Record<string, ((value: unknown) => void)[]>;
                _theme: string;
                get theme(): string;
                set theme(value: string);
            };
        };
        bridgedWindow.REDAppBridge = bridgedWindow.REDAppBridge || {
            _listeners: {},
            on<T>(type: string, listener: (value: T) => void) {
                this._listeners[type] = this._listeners[type] || [];
                this._listeners[type].push(
                    listener as (value: unknown) => void
                );
            },
            off<T>(type: string, listener: (value: T) => void) {
                this._listeners[type] = this._listeners[type] || [];
                this._listeners[type] = this._listeners[type].filter(
                    l => l !== listener
                );
            },
            _trigger(type: string, value: unknown) {
                this._listeners[type] = this._listeners[type] || [];
                this._listeners[type].forEach(l => l(value));
            },
            _theme: undefined,
            get theme() {
                return this._theme;
            },
            set theme(value: string) {
                this._theme = value;
                this._trigger('theme', value);
            },
        };
        bridgedWindow.REDAppBridge.theme = theme;
    }, [theme]);

    return (
        <StyledRoot className={`red-ui-container ${className}`} {...props}>
            <link rel="stylesheet" href={faCssUrl} />

            <link
                rel="stylesheet"
                href={jqueryUiCssUrl}
                onLoad={handleCssOnLoad}
            />

            <link rel="stylesheet" href={redCssUrl} onLoad={handleCssOnLoad} />

            <link
                rel="stylesheet"
                href={redTypedInputCssUrl}
                onLoad={handleCssOnLoad}
            />

            <StyledRedUi />

            <div className="red-ui-editor">{loaded ? children : null}</div>
        </StyledRoot>
    );
};

export default RedUiContainer;
