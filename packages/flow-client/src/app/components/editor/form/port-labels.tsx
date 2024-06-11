import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';

const StyledPortLabels = styled.div`
    .groups {
        display: flex;

        background-color: var(--color-background-element-light);
        border: 1px solid var(--color-border-light);
        border-radius: var(--editor-form-input-border-radius);
        padding: 10px;

        .port-label-group {
            background-color: var(--color-background-main);
            padding: 5px 10px;

            h6 {
                font-size: 0.8em;
                margin: 0 0 15px;
                font-weight: 500;
                text-align: center;
            }

            .label {
                margin-bottom: 15px;
                position: relative;

                label {
                    display: block;
                    margin: auto;
                    padding: 0.6rem;
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 1.5rem;
                }

                input {
                    padding-left: 1.7rem;
                }
            }
        }
    }
`;

type SinglePortLabelsProps = {
    name: string;
    count: number;
    labels: string[];
    onChange: (labels: string[]) => void;
    className?: string;
    [key: string]: unknown;
};

const SinglePortLabels: React.FC<SinglePortLabelsProps> = ({
    count,
    labels,
    name,
    onChange,
    className = '',
    ...props
}) => {
    const handleChange = useCallback(
        (index: number, value: string) => {
            const newLabels = [...labels];
            newLabels[index] = value;
            onChange(newLabels);
        },
        [labels, onChange]
    );

    return (
        <div {...props} className={`port-label-group ${className}`}>
            <h6>{name}: </h6>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="label">
                    <label>{index + 1}</label>
                    <input
                        type="text"
                        value={labels[index] || ''}
                        onChange={e => handleChange(index, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
};

export type PortLabelsProps = {
    inputs: number;
    outputs: number;
    inputLabels: string[];
    outputLabels: string[];
    onChange?: (inputLabels: string[], outputLabels: string[]) => void;
    className?: string;
};

export const PortLabels: React.FC<PortLabelsProps> = ({
    inputs,
    outputs,
    inputLabels,
    outputLabels,
    onChange,
    className = '',
}) => {
    const labelsRef = useRef<HTMLDivElement>(null);

    const handleLabelClick = useCallback(() => {
        labelsRef.current?.querySelector('input')?.focus();
    }, []);

    const handleInputChange = (labels: string[]) => {
        onChange?.(labels, outputLabels);
    };

    const handleOutputChange = (labels: string[]) => {
        onChange?.(inputLabels, labels);
    };

    return (
        <StyledPortLabels
            className={`port-labels ${className}`}
            ref={labelsRef}
        >
            <label onClick={handleLabelClick}>Port Labels: </label>

            <div className="groups">
                <SinglePortLabels
                    className="input-labels"
                    name="Inputs"
                    count={inputs}
                    labels={inputLabels}
                    onChange={handleInputChange}
                />

                <SinglePortLabels
                    className="output-labels"
                    name="Outputs"
                    count={outputs}
                    labels={outputLabels}
                    onChange={handleOutputChange}
                />
            </div>
        </StyledPortLabels>
    );
};

export default PortLabels;
