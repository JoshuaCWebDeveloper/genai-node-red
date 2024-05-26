import styled from 'styled-components';
import { useAppSelector } from '../../redux/hooks';
import { selectActiveFlow } from '../../redux/modules/builder/builder.slice';
import { selectFlowEntityById } from '../../redux/modules/flow/flow.slice';

const StyledWorkspace = styled.div`
    display: flex;
    flex-direction: column;

    color: var(--color-text-sharp);
    font-size: 0.8em;

    p {
        margin: 0;

        .type {
            font-weight: bold;
            text-transform: capitalize;
        }

        i {
            margin-left: 5px;
            color: var(--color-text-medium);
            cursor: pointer;

            &:hover {
                color: var(--color-text-sharp);
            }
        }
    }
`;

export const Workspace = () => {
    const activeFlowId = useAppSelector(selectActiveFlow);
    const activeFlow = useAppSelector(state =>
        activeFlowId ? selectFlowEntityById(state, activeFlowId) : null
    );

    return (
        <StyledWorkspace className="workspace">
            {activeFlow ? (
                <p>
                    <span className="type">{activeFlow.type}:</span>{' '}
                    {activeFlow.name}{' '}
                    <i
                        className="fa-solid fa-pencil"
                        onClick={() => {
                            // TODO: Open the flow editor
                        }}
                    />
                </p>
            ) : (
                <p>No active workspace</p>
            )}
        </StyledWorkspace>
    );
};

export default Workspace;
