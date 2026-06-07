export type HealthResponse = {
    status: DependencyStatus;
    service: 'api';
    timestamp: string;
    uptime: number;
};

export type DependencyStatus = 'ok' | 'error';

export type ReadinessResponse = HealthResponse & {
    dependencies: {
        postgres: DependencyStatus;
        redis: DependencyStatus;
    };
};
