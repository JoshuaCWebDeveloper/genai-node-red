import React from 'react';
import styled from 'styled-components';

export type SearchBarProps = {
    onSearch: (query: string) => void;
};

const StyledSearchInput = styled.input``;

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    return (
        <StyledSearchInput
            className="search-bar"
            type="text"
            placeholder="Search nodes..."
            onChange={e => onSearch(e.target.value)}
        />
    );
};

export default SearchBar;
