export type Context = {
    user: User;
};

export type User = {
    emails: string;
    first_name: string;
    last_name: string;
    ugkthid: string;
    user: string;
    pls: string[];
    mandates: Mandate[];
    groups: Group[];
};

export type Group = {
    id: number;
    name: string;
    identifier: string;
};

export type Mandate = {
    id: number;
    title: string;
    description: string;
    identifier: string;
    email: string;
    active: boolean;
    Group: Group;
};

export type CurrentMandate = {
    Role: Mandate;
};
