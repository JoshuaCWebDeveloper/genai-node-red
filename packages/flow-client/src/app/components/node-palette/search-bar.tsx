import React from 'react';
import styled from 'styled-components';

export type SearchBarProps = {
    onSearch: (query: string) => void;
};

const StyledSearchInput = styled.input`
    margin-bottom: 20px;
    display: block;
    width: 100%;
    height: 30px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    return (
        <StyledSearchInput
            type="text"
            placeholder="Search nodes..."
            onChange={e => onSearch(e.target.value)}
        />
    );
};

export default SearchBar;
