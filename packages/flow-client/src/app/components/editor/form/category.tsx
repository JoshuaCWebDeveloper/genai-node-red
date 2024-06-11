import styled from 'styled-components';
import { FormEvent, useCallback, useRef, useState } from 'react';

import { useAppSelector } from '../../../redux/hooks';
import { selectCategories } from '../../../redux/modules/palette/node.slice';

const StyledCategory = styled.div`
    position: relative;

    input {
        padding-right: var(--editor-form-input-height);
    }

    button {
        background-color: transparent;
        border: 0;
        color: var(--color-text-sharp);
        cursor: pointer;
        position: absolute;
        right: 0;
        bottom: 1px;
        width: var(--editor-form-input-height);
        height: var(--editor-form-input-height);

        &:hover {
            background-image: radial-gradient(
                circle at center,
                var(--color-text-medium) 0%,
                transparent 30%
            );
        }
    }
`;

const NEW_CATEGORY_OPTION = `add-new-category-option-${Date.now()}`;

export type CategoryProps = {
    className?: string;
    category: string;
    onChange?: (category: string) => void;
};

// eslint-disable-next-line no-empty-pattern
export const Category = ({
    className = '',
    category,
    onChange,
}: CategoryProps) => {
    const categories = useAppSelector(state =>
        selectCategories(state).sort((a, b) => a.localeCompare(b))
    );

    const [addNewCategory, setAddNewCategory] = useState(false);
    const previousCategory = useRef(category);
    const inputId = useRef(`category-input-${Date.now()}`);

    const handleLabelClick = useCallback(() => {
        (
            document.querySelector(
                `select#${inputId.current}`
            ) as HTMLSelectElement
        )?.showPicker();
    }, []);

    const handleCategoryChange = useCallback(
        (e: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
            const newCategory = (
                e.target as HTMLInputElement | HTMLSelectElement
            ).value;

            if (!newCategory) {
                return;
            }

            // if this is the add new option
            if (newCategory === NEW_CATEGORY_OPTION) {
                previousCategory.current = category;
                setAddNewCategory(true);
                return;
            }

            onChange?.(newCategory);
        },
        [category, onChange]
    );

    const handleButtonClick = useCallback(() => {
        setAddNewCategory(false);
        if (previousCategory.current !== category) {
            onChange?.(previousCategory.current);
        }
    }, [category, onChange]);

    return (
        <StyledCategory className={`category ${className}`}>
            <label htmlFor={inputId.current} onClick={handleLabelClick}>
                Category:{' '}
            </label>
            {addNewCategory ? (
                <>
                    <input
                        id={inputId.current}
                        type="text"
                        onChange={handleCategoryChange}
                    />

                    <button onClick={handleButtonClick}>
                        <i className="fa-solid fa-times" />
                    </button>
                </>
            ) : (
                <select
                    id={inputId.current}
                    onChange={handleCategoryChange}
                    value={category}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}

                    <optgroup label="---">
                        <option className="add-new" value={NEW_CATEGORY_OPTION}>
                            Add new...
                        </option>
                    </optgroup>
                </select>
            )}
        </StyledCategory>
    );
};

export default Category;
