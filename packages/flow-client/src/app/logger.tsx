import { useEffect } from 'react';

import { useAppSelector } from './redux/hooks';
import { selectEditing } from './redux/modules/builder/builder.slice';
import {
    selectAllDirectories,
    selectAllFlowEntities,
    selectAllFlowNodes,
} from './redux/modules/flow/flow.slice';

export const Logger = () => {
    const flowEntities = useAppSelector(selectAllFlowEntities);
    const flowNodes = useAppSelector(selectAllFlowNodes);
    const directories = useAppSelector(selectAllDirectories);
    const editing = useAppSelector(selectEditing);

    useEffect(() => {
        console.log('Flow state: ', { flowEntities, flowNodes, directories });
    }, [flowEntities, flowNodes, directories]);

    useEffect(() => {
        console.log('Builder state: ', { editing });
    }, [editing]);

    return null; // This component does not render anything
};

export default Logger;
