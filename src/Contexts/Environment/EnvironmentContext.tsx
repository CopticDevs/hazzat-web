import { createContext } from 'react';

export enum Environment {
    Development,
    PreProduction,
    Production
}

export interface IEnvironmentProperties {
    environment: Environment;
    baseUrl: string;
};

export const devEnvProps: IEnvironmentProperties = {
    environment: Environment.Development,
    baseUrl: "https://hazzat-api-dev.azurewebsites.net"
};

export const ppeEnvProps: IEnvironmentProperties = {
    environment: Environment.PreProduction,
    baseUrl: "https://hazzat-api-ppe.azurewebsites.net"
};

export const prodEnvProps: IEnvironmentProperties = {
    environment: Environment.Production,
    baseUrl: "https://api.hazzat.com"
};

export interface IEnvironmentContext {
    environmentProperties: IEnvironmentProperties;
    setEnvironmentProperties?: (targetEnvironmentProperties: IEnvironmentProperties) => void;
};

const defaultState: IEnvironmentContext = {
    environmentProperties: prodEnvProps
};

export const EnvironmentContext = createContext<IEnvironmentContext>(defaultState);
