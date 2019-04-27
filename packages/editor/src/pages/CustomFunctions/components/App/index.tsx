import React, { Component } from 'react';
import queryString from 'query-string';
import {
  getCustomFunctionsInfoForRegistration,
  registerCustomFunctions,
  getCustomFunctionEngineStatusSafe,
  filterCustomFunctions,
  findScript,
} from './utilities';
import {
  getCustomFunctionCodeLastUpdated as getCFCodeLastModified,
  getCustomFunctionLogsFromLocalStorage,
} from 'common/lib/utilities/localStorage';
import { getLogsFromAsyncStorage } from './utilities/logs';
import { loadAllSolutionsAndFiles } from '../../../Editor/store/localStorage';
import { invokeGlobalErrorHandler } from 'common/lib/utilities/splash.screen';
import { ScriptLabError } from 'common/lib/utilities/error';
import { IFunction } from 'custom-functions-metadata';

interface IState {
  customFunctionsSummaryItems: Array<ICustomFunctionParseResult<any>>;
  customFunctionsCode: string;

  runnerLastUpdated: number;
  customFunctionsSolutionLastModified: number;

  isStandalone: boolean;
  engineStatus: ICustomFunctionEngineStatus | null;

  logs: ILogData[];
  error?: Error;
}

export interface IPropsToUI extends IState {
  fetchLogs: () => void;
  clearLogs: () => void;
}

const AppHOC = (UI: React.ComponentType<IPropsToUI>) =>
  class App extends Component<{}, IState> {
    private localStoragePollingInterval: any;

    constructor(props: {}) {
      super(props);

      const cfSolutions = getCustomFunctionsSolutions();
      const registrationResult = getRegistrationResult(cfSolutions);

      this.state = {
        runnerLastUpdated: Date.now(),
        customFunctionsSolutionLastModified: getCFCodeLastModified(),
        isStandalone: !queryString.parse(window.location.href.split('?').slice(-1)[0])
          .backButton,
        customFunctionsSummaryItems: registrationResult.parseResults,
        customFunctionsCode: registrationResult.code,
        engineStatus: null,
        logs: [],
      };
    }

    async componentDidMount() {
      const engineStatus = await getCustomFunctionEngineStatusSafe();
      this.setState({ engineStatus: engineStatus });

      try {
        if (this.state.customFunctionsSummaryItems.length > 0) {
          await registerCustomFunctions(
            this.state.customFunctionsSummaryItems,
            this.state.customFunctionsCode,
          );
        }
      } catch (e) {
        this.setState({
          error: e,
        });
      }

      this.localStoragePollingInterval = setInterval(
        () =>
          this.setState({
            customFunctionsSolutionLastModified: getCFCodeLastModified(),
          }),
        500,
      );
    }

    componentWillUnmount() {
      clearInterval(this.localStoragePollingInterval);
    }

    fetchLogs = async () => {
      const isUsingAsyncStorage =
        !!this.state.engineStatus.nativeRuntime &&
        (window as any).Office &&
        (window as any).Office.context &&
        (window as any).Office.context.requirements &&
        (window as any).Office.context.requirements.isSetSupported(
          'CustomFunctions',
          1.4,
        );

      const logs: ILogData[] = isUsingAsyncStorage
        ? await getLogsFromAsyncStorage()
        : getCustomFunctionLogsFromLocalStorage();

      this.setState({ logs: [...this.state.logs, ...logs] });
    };

    clearLogs = () => this.setState({ logs: [] });

    render() {
      return <UI {...this.state} fetchLogs={this.fetchLogs} clearLogs={this.clearLogs} />;
    }
  };

export default AppHOC;

///////////////////////////////////////

function getCustomFunctionsSolutions(): ISolution[] {
  const { solutions: allSolutions, files: allFiles } = loadAllSolutionsAndFiles();

  const solutions = Object.values(allSolutions).map(solution => {
    const files = Object.values(allFiles).filter(file =>
      solution.files.includes(file.id),
    );

    return { ...solution, files };
  });

  return filterCustomFunctions(solutions);
}

function getRegistrationResult(
  cfSolutions: ISolution[],
): { parseResults: Array<ICustomFunctionParseResult<IFunction>>; code: string } {
  const hasPython = cfSolutions
    .map(solution => findScript(solution))
    .find(script => script.language === 'python');

  if (hasPython) {
    const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    ['jupyter.url', 'jupyter.token', 'jupyter.notebook']
      .map(settingName => ({
        name: settingName,
        value: userSettings[settingName],
      }))
      .forEach(pair => {
        if (!pair.value || (pair.value as string).trim().length === 0) {
          invokeGlobalErrorHandler(
            new ScriptLabError(
              `To support Python custom functions, you must follow the setup steps ` +
                `and enter the required settings in the editor's "Settings" page. ` +
                `Please do so now and then reload this page.`,
            ),
            { showExpanded: true },
          );
        }
      });

    return { code: '', parseResults: [] };
  } else {
    return getCustomFunctionsInfoForRegistration(cfSolutions);
  }
}
