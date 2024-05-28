import React, {
    forwardRef,
    useCallback,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import styled from 'styled-components';

const StyledDeleteButton = styled.button`
    background-color: transparent;
    border: 0;
    color: inherit;
    cursor: pointer;

    i {
        transition: transform ease 500ms;
    }

    &.confirming i {
        transform: rotate(90deg);
    }
`;

export type ConfirmableDeleteButtonRef = {
    triggerDelete: (e: React.BaseSyntheticEvent) => void;
};

export const useConfirmableDelete = () => {
    const deleteRef = useRef<ConfirmableDeleteButtonRef>(null);

    const triggerDelete = useCallback((e: React.BaseSyntheticEvent) => {
        deleteRef.current?.triggerDelete(e);
    }, []);

    return {
        deleteRef,
        triggerDelete,
    };
};

export type ConfirmableDeleteButtonProps = {
    className?: string;
    onDelete?: (e: React.BaseSyntheticEvent) => void;
    confirmationWait?: number;
    contentBefore?: React.ReactNode;
    contentAfter?: React.ReactNode;
    [key: string]: unknown;
};

export const ConfirmableDeleteButton = forwardRef<
    ConfirmableDeleteButtonRef,
    ConfirmableDeleteButtonProps
>(
    (
        {
            className,
            onDelete,
            confirmationWait = 3000,
            contentBefore,
            contentAfter,
            ...props
        },
        ref
    ) => {
        const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
        const deleteConfirmTimeout = useRef<NodeJS.Timeout | null>(null);

        const handleDeleteClick = useCallback(
            (e: React.BaseSyntheticEvent) => {
                e.stopPropagation();

                if (!isDeleteConfirming) {
                    setIsDeleteConfirming(true);
                    deleteConfirmTimeout.current = setTimeout(
                        () => setIsDeleteConfirming(false),
                        confirmationWait
                    );
                } else {
                    if (deleteConfirmTimeout.current) {
                        clearTimeout(deleteConfirmTimeout.current);
                        deleteConfirmTimeout.current = null;
                    }
                    onDelete?.(e);
                }
            },
            [confirmationWait, isDeleteConfirming, onDelete]
        );

        useImperativeHandle(ref, () => ({
            triggerDelete(e: React.BaseSyntheticEvent) {
                handleDeleteClick(e);
            },
        }));

        return (
            <StyledDeleteButton
                className={`delete ${
                    isDeleteConfirming ? 'confirming' : ''
                } ${className}`}
                onClick={handleDeleteClick}
                {...props}
            >
                {contentBefore}

                <i className="fas fa-trash-can"></i>

                {contentAfter}
            </StyledDeleteButton>
        );
    }
);

export default ConfirmableDeleteButton;
