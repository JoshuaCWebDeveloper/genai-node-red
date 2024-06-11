import { useCallback } from 'react';
import styled from 'styled-components';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectTheme,
} from '../../redux/modules/builder/builder.slice';

const StyledSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ffd000;
        transition: 0.4s;
        border-radius: 34px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 5px;
    }

    .slider:before {
        position: absolute;
        content: '';
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
    }

    input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    input:checked + .slider {
        background-color: #2196f3;
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }

    .light-icon,
    .dark-icon {
        color: #fff;
        font-size: 12px;
    }

    .dark-icon {
        visibility: hidden;
    }

    input:checked + .slider .light-icon {
        visibility: hidden;
    }

    input:checked + .slider .dark-icon {
        visibility: visible;
    }
`;

export type ThemeSwitcherProps = Record<string, never>;

export const ThemeSwitcher = () => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector(selectTheme);

    const handleThemeChange = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        dispatch(builderActions.setTheme(newTheme));
    }, [dispatch, theme]);

    return (
        <StyledSwitch className="theme-switcher">
            <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={handleThemeChange}
            />
            <span className="slider round">
                <i className="fa-solid fa-moon dark-icon" />
                <i className="fa-solid fa-sun light-icon" />
            </span>
        </StyledSwitch>
    );
};

export default ThemeSwitcher;
