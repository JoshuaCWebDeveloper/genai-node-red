import { createGlobalStyle, css } from 'styled-components';

export type Theme = keyof typeof themes;

const defaultTheme = css`
    :root {
        --color-background-plain: #fff;
        --color-background-main: #f1f1f1;
        --color-background-element-light: #e9e9e9;
        --color-background-element-medium: #ccc;
        --color-background-element-sharp: #aaa;

        --color-border-light: #ccc;
        --color-border-medium: #999;
        --color-border-sharp: #000;

        --color-text-light: #ccc;
        --color-text-medium: #777;
        --color-text-sharp: #333;
    }
`;

const themes = {
    light: createGlobalStyle`
        ${defaultTheme}
    `,
    dark: createGlobalStyle`
        ${defaultTheme}

        :root {
            --color-background-plain: #000;
            --color-background-main: #222;
            --color-background-element-light: #2b2b2b;
            --color-background-element-medium: #555;
            --color-background-element-sharp: #999;

            --color-border-light: #555;
            --color-border-medium: #999;
            --color-border-sharp: #fff;

            --color-text-light: #555;
            --color-text-medium: #aaa;
            --color-text-sharp: #fff;
        }
    `,
};

export default themes;
