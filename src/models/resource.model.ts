export interface ResourceModel {
    id: string;
    name: string;
}

export interface QueryParamModel {
    disabled?: boolean;
    offset?: number;
    limit?: number;
}