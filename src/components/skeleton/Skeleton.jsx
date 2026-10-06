import React from 'react';
import './skeleton.css';

export function Skeleton({ className = '', style, ...props }) {
    return (
        <span
            className={`skeleton ${className}`.trim()}
            style={style}
            aria-hidden="true"
            {...props}
        />
    );
}

export function SkeletonText({ lines = 4, className = '' }) {
    return (
        <div className={`skeleton-text-block ${className}`.trim()}>
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton
                    key={index}
                    className="skeleton-line"
                    style={{
                        width: index === lines - 1 ? '72%' : '100%',
                    }}
                />
            ))}
        </div>
    );
}
