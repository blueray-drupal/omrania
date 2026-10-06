import React from 'react';
import { Skeleton, SkeletonText } from './Skeleton';

export function SidebarNavSkeleton({ count = 5 }) {
    return (
        <div className="skeleton-sidebar" aria-hidden="true">
            <Skeleton className="skeleton-sidebar-title" />
            {Array.from({ length: count }, (_, index) => (
                <Skeleton key={index} className="skeleton-sidebar-item" />
            ))}
        </div>
    );
}

export function CardGridSkeleton({ count = 3 }) {
    return (
        <div className="skeleton-cards-list" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <article key={index} className="skeleton-card">
                    <Skeleton className="skeleton-card-image" />
                    <div className="skeleton-card-body">
                        <Skeleton className="skeleton-card-date" />
                        <Skeleton className="skeleton-card-heading" />
                        <Skeleton className="skeleton-line" />
                        <Skeleton className="skeleton-line" style={{ width: '88%' }} />
                        <Skeleton className="skeleton-line" style={{ width: '40%' }} />
                    </div>
                </article>
            ))}
        </div>
    );
}

export function JobListSkeleton({ count = 3 }) {
    return (
        <div className="skeleton-cards-list" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="skeleton-job-card">
                    <Skeleton className="skeleton-card-heading" style={{ width: '60%' }} />
                    <Skeleton className="skeleton-line" style={{ width: '35%', marginTop: 12 }} />
                    <Skeleton className="skeleton-line" style={{ width: '25%', marginTop: 16 }} />
                </div>
            ))}
        </div>
    );
}

export function TenderListSkeleton({ count = 3 }) {
    return (
        <div className="skeleton-cards-list" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="skeleton-tender-card">
                    <div className="skeleton-tender-main">
                        <Skeleton className="skeleton-card-heading" />
                        <Skeleton className="skeleton-line" style={{ marginTop: 12 }} />
                        <Skeleton className="skeleton-line" style={{ width: '90%', marginTop: 8 }} />
                        <Skeleton className="skeleton-line" style={{ width: '30%', marginTop: 16 }} />
                    </div>
                    <div className="skeleton-tender-meta">
                        <Skeleton style={{ height: 32, width: '100%', borderRadius: 999 }} />
                        <Skeleton className="skeleton-line" style={{ width: '80%' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <div className="skeleton-table" aria-hidden="true">
            <div className="skeleton-table-head">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} />
                ))}
            </div>
            {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={rowIndex} className="skeleton-table-row">
                    {Array.from({ length: 4 }, (_, colIndex) => (
                        <Skeleton
                            key={colIndex}
                            style={{ width: colIndex === 0 ? '24px' : '100%' }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function DetailContentSkeleton() {
    return (
        <div aria-hidden="true">
            <Skeleton className="skeleton-title" />
            <Skeleton className="skeleton-subtitle" />
            <SkeletonText lines={10} />
            <Skeleton className="skeleton-detail-image" />
        </div>
    );
}

export function FaqListSkeleton({ count = 4 }) {
    return (
        <div aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="skeleton-faq-item">
                    <Skeleton className="skeleton-faq-question" />
                    <SkeletonText lines={3} />
                </div>
            ))}
        </div>
    );
}

export function GalleryGridSkeleton({ count = 8 }) {
    return (
        <div className="skeleton-gallery-grid" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <Skeleton key={index} className="skeleton-gallery-item" />
            ))}
        </div>
    );
}

export function FileListSkeleton({ count = 6 }) {
    return (
        <div aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="skeleton-file-row">
                    <Skeleton className="skeleton-file-icon" />
                    <Skeleton className="skeleton-file-text" />
                </div>
            ))}
        </div>
    );
}

export function ProjectsPageSkeleton() {
    return (
        <div aria-hidden="true">
            <div className="skeleton-search-bar">
                <Skeleton className="skeleton-search-input" />
                <Skeleton className="skeleton-search-btn" />
            </div>
            <CardGridSkeleton count={4} />
        </div>
    );
}

export function FormBlockSkeleton() {
    return (
        <div className="skeleton-form-block" aria-hidden="true">
            <Skeleton className="skeleton-title" style={{ width: '50%' }} />
            <SkeletonText lines={2} />
            <Skeleton className="skeleton-form-field" />
            <Skeleton className="skeleton-form-field" />
            <Skeleton className="skeleton-form-textarea" />
            <Skeleton className="skeleton-form-submit" />
        </div>
    );
}

export function SliderHeroSkeleton() {
    return <Skeleton className="skeleton-hero" aria-hidden="true" />;
}

export function ServicesHomeSkeleton() {
    return (
        <div aria-hidden="true">
            <Skeleton className="skeleton-title" style={{ margin: '0 auto 24px' }} />
            <div className="skeleton-services-grid">
                {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="skeleton-service-item" />
                ))}
            </div>
        </div>
    );
}

export function FactsHomeSkeleton() {
    return (
        <div className="skeleton-facts-grid" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="skeleton-fact-item" />
            ))}
        </div>
    );
}

export function NewsRowSkeleton() {
    return (
        <div aria-hidden="true">
            <Skeleton className="skeleton-title" style={{ marginBottom: 24 }} />
            <div className="skeleton-news-grid">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="skeleton-news-card" />
                ))}
            </div>
        </div>
    );
}

export function NewsTickerSkeleton() {
    return <Skeleton className="skeleton-ticker" aria-hidden="true" />;
}

export function WelcomeSkeleton() {
    return (
        <div className="skeleton-welcome" aria-hidden="true">
            <SkeletonText lines={12} />
            <Skeleton className="skeleton-welcome-image" />
        </div>
    );
}

export function OrgChartSkeleton() {
    return <Skeleton className="skeleton-org-chart" aria-hidden="true" />;
}

export function UsefulLinksSkeleton() {
    return (
        <div aria-hidden="true">
            {Array.from({ length: 3 }, (_, groupIndex) => (
                <div key={groupIndex} className="skeleton-links-group">
                    <Skeleton className="skeleton-links-title" />
                    {Array.from({ length: 4 }, (_, linkIndex) => (
                        <Skeleton
                            key={linkIndex}
                            className="skeleton-line"
                            style={{ marginBottom: 8, width: `${70 - linkIndex * 8}%` }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function renderPageSkeleton(type) {
    switch (type) {
        case 'cards':
            return <CardGridSkeleton />;
        case 'detail':
            return <DetailContentSkeleton />;
        case 'table':
            return <TableSkeleton />;
        case 'faq':
            return <FaqListSkeleton />;
        case 'gallery':
            return <GalleryGridSkeleton />;
        case 'jobs':
            return <JobListSkeleton />;
        case 'tenders':
            return <TenderListSkeleton />;
        case 'projects':
            return <ProjectsPageSkeleton />;
        case 'files':
            return <FileListSkeleton />;
        case 'form':
            return <FormBlockSkeleton />;
        case 'welcome':
            return <WelcomeSkeleton />;
        case 'org-chart':
            return <OrgChartSkeleton />;
        case 'useful-links':
            return <UsefulLinksSkeleton />;
        case 'content':
        default:
            return <SkeletonText lines={8} />;
    }
}
