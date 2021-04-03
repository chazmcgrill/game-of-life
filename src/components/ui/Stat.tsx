import React from 'react';

interface StatProps {
    label: string;
    value: number;
}

const Stat = ({ label, value }: StatProps): JSX.Element => {
    return (
        <div className="stat-container">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
        </div>
    );
};

export default Stat;
