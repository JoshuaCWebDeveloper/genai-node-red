import faCssUrl from '@fortawesome/fontawesome-free/css/all.css?url';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import root from 'react-shadow/styled-components';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectEditing,
} from '../../redux/modules/builder/builder.slice';
import {
    FlowNodeEntity,
    selectEntityById,
} from '../../redux/modules/flow/flow.slice';
import jqueryUiCssUrl from '../red/jquery-ui.css?url';
import redCssUrl from '../red/red-style.css?url';
import redTypedInputCssUrl from '../red/red-typed-input.css?url';
import RedUi from './red-ui';

const StyledEditor = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: flex-end;
    }
    .editor-pane {
        position: absolute;
        right: 0;
        width: 30%;
        height: 100%;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        min-width: 505px;
    }
`;

export const NodeEditor = () => {
    const dispatch = useAppDispatch();
    const editing = useAppSelector(selectEditing);
    const editingNode = useAppSelector(state =>
        selectEntityById(state, editing ?? '')
    ) as FlowNodeEntity;
    const [loadedCss, setLoadedCss] = useState({
        'jquery-ui.css': false,
        'red-style.css': false,
        'red-typed-input.css': false,
    });

    const cssLoaded = useMemo(() => {
        return (
            loadedCss['jquery-ui.css'] &&
            loadedCss['red-style.css'] &&
            loadedCss['red-typed-input.css']
        );
    }, [loadedCss]);

    const handleCssOnLoad = useCallback(
        (e: React.SyntheticEvent<HTMLLinkElement>) => {
            const cssFile = new URL(e.currentTarget.href).pathname
                .split('/')
                .pop() as keyof typeof loadedCss;
            setLoadedCss(prev => ({ ...prev, [cssFile]: true }));
        },
        []
    );

    const handleClose = useCallback(() => {
        dispatch(builderActions.clearEditing());
        setLoadedCss({
            'jquery-ui.css': false,
            'red-style.css': false,
            'red-typed-input.css': false,
        });
    }, [dispatch]);

    useEffect(() => {
        if (
            !loadedCss['jquery-ui.css'] ||
            !loadedCss['red-style.css'] ||
            !loadedCss['red-typed-input.css']
        ) {
            return;
        }
    }, [loadedCss]);

    if (!editingNode) return null;

    return (
        <StyledEditor>
            <div className="overlay"></div>
            <div className="editor-pane">
                <root.div className="editor-template">
                    <link
                        rel="stylesheet"
                        href={faCssUrl}
                        onLoad={handleCssOnLoad}
                    />
                    <link
                        rel="stylesheet"
                        href={jqueryUiCssUrl}
                        onLoad={handleCssOnLoad}
                    />
                    <link
                        rel="stylesheet"
                        href={redCssUrl}
                        onLoad={handleCssOnLoad}
                    />
                    <link
                        rel="stylesheet"
                        href={redTypedInputCssUrl}
                        onLoad={handleCssOnLoad}
                    />
                    {cssLoaded ? (
                        <RedUi
                            editingNode={editingNode}
                            onClose={handleClose}
                        />
                    ) : (
                        <div>Loading...</div>
                    )}
                </root.div>
            </div>
        </StyledEditor>
    );
};

export default NodeEditor;
