import styled from 'styled-components';

import {
    builderActions,
    selectShowPrimarySidebar,
} from '../../redux/modules/builder/builder.slice';
import FlowTree from '../flow-tree/flow-tree';
import { Panel } from './panel';

const StyledPrimarySidebar = styled(Panel)`
    width: 250px;
`;

export const PrimarySidebar = () => {
    return (
        <StyledPrimarySidebar
            className="primary-sidebar"
            isVisibleSelector={selectShowPrimarySidebar}
            closeAction={builderActions.togglePrimarySidebar}
        >
            <FlowTree />
        </StyledPrimarySidebar>
    );
};

export default PrimarySidebar;
