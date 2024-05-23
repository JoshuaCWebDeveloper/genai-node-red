import ReactDOM from 'react-dom';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import styled from 'styled-components';

const StyledTooltip = styled(ReactTooltip)`
    --rt-opacity: 1;
    background-color: var(--color-background-plain);
    color: var(--color-text-sharp);
    padding: 2px 5px 3px;
    border-radius: 2px;
    font-size: 0.8em;
`;

export type TooltipProps = {
    className?: string;
    children?: React.ReactNode;
    [index: string]: unknown;
};

export const Tooltip = ({
    className = '',
    children,
    ...props
}: TooltipProps) => {
    return ReactDOM.createPortal(
        <StyledTooltip
            disableStyleInjection={true}
            place="bottom-start"
            delayShow={1000}
            className={'tooltip ' + className}
            {...props}
        >
            {children}
        </StyledTooltip>,
        document.body
    );
};

export default Tooltip;
