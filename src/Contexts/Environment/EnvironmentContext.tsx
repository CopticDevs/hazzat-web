import { createContext } from 'react';

export enum Environment {
    Development,
    PreProduction,
    Production
}

export interface IEnvironmentProperties {
    environment: Environment;
    baseUrl: string;
    cloudFrontUrl: string;
};

export const devEnvProps: IEnvironmentProperties = {
    environment: Environment.Development,
    baseUrl: "https://hazzat-api-dev.azurewebsites.net",
    cloudFrontUrl: "https://d1zhmhuei1bwco.cloudfront.net"
};

export const ppeEnvProps: IEnvironmentProperties = {
    environment: Environment.PreProduction,
    baseUrl: "https://hazzat-api-ppe.azurewebsites.net",
    cloudFrontUrl: "https://d1zhmhuei1bwco.cloudfront.net"
};

export const prodEnvProps: IEnvironmentProperties = {
    environment: Environment.Production,
    baseUrl: "https://api.hazzat.com",
    cloudFrontUrl: "https://d1zhmhuei1bwco.cloudfront.net"
};

export interface IEnvironmentContext {
    environmentProperties: IEnvironmentProperties;
    setEnvironmentProperties?: (targetEnvironmentProperties: IEnvironmentProperties) => void;
};

const defaultState: IEnvironmentContext = {
    environmentProperties: prodEnvProps
};

export const EnvironmentContext = createContext<IEnvironmentContext>(defaultState);
