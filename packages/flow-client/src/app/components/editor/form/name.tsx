import React, { useCallback } from 'react';
import styled from 'styled-components';

const StyledName = styled.div``;

export type NameProps = {
    name: string;
    onChange?: (name: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    [index: string]: unknown;
};

export const Name = ({
    name,
    onChange,
    className = '',
    ...props
}: NameProps) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value, e);
        },
        [onChange]
    );

    return (
        <StyledName className={`name ${className}`}>
            <label htmlFor="name">Name:</label>
            <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                {...props}
            />
        </StyledName>
    );
};

export default Name;
