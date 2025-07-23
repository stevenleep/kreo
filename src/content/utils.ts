import { useCallback, useState } from 'react';
import { __assign, __read } from "tslib";

const isFunction = function (value: any) {
  return typeof value === 'function';
};

export const useSetState = (initialState: any) => {
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