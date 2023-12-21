import React from "react";
import { useEffect, useState } from "react";
import { devEnvProps, Environment, EnvironmentContext, IEnvironmentProperties, ppeEnvProps, prodEnvProps } from "./EnvironmentContext";

interface IProps {
    children?: React.ReactNode;
}

const parseEnvStr = (envStr: string): Environment => {
    switch (envStr.toUpperCase()) {
        case "PROD":
            return Environment.Production;
        case "PPE":
            return Environment.PreProduction;
        case "DEV":
            return Environment.Development;
        default:
            return Environment.Production;
    }
}

const setDefaultEnvironment = (env: Environment): IEnvironmentProperties => {
    switch (env) {
        case Environment.Production:
            return prodEnvProps;
        case Environment.PreProduction:
            return ppeEnvProps;
        case Environment.Development:
            return devEnvProps;
        default:
            return prodEnvProps;
    }
}

function EnvironmentProvider(props: IProps) {
    const [environmentProperties, setEnvironmentProperties] = useState<IEnvironmentProperties>(setDefaultEnvironment(Environment.Production));

    const setApplicationEnvironment = React.useCallback(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const envStr = urlSearchParams.get('env') || "PROD";
        const env = parseEnvStr(envStr);
        const envProps = setDefaultEnvironment(env);

        setEnvironmentProperties(envProps);
    }, []);

    useEffect(() => {
        setApplicationEnvironment();
    }, [setApplicationEnvironment]);

    return (
        <EnvironmentContext.Provider value={{
            environmentProperties,
            setEnvironmentProperties
        }}>
            {props.children}
        </EnvironmentContext.Provider>
    )
}

export default EnvironmentProvider;
