import { useCallback, useState } from "react";
import { __assign, __read } from "tslib";

export type SetState<S extends Record<string, any>> = <K extends keyof S>(
    state: Pick<S, K> | null | ((prevState: Readonly<S>) => Pick<S, K> | S | null),
) => void;

export type UseSetState = <S extends Record<string, any>>(initialState: S | (() => S)) => [S, SetState<S>];

const isFunction = function (value: any) {
    return typeof value === "function";
};

export const useSetState: UseSetState = (initialState: any) => {
    var _a = __read(useState(initialState), 2),
        state = _a[0],
        setState = _a[1];
    var setMergeState = useCallback(function (patch: any) {
        setState(function (prevState: any) {
            var newState = isFunction(patch) ? patch(prevState) : patch;
            return newState ? __assign(__assign({}, prevState), newState) : prevState;
        });
    }, []);
    return [state, setMergeState];
};
