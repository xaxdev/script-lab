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
import {
  invokeGlobalErrorHandler,
  hideSplashScreen,
} from 'common/lib/utilities/splash.screen';
import { ScriptLabError } from 'common/lib/utilities/error';
import { IFunction } from 'custom-functions-metadata';
import { JupyterNotebook } from './Jupyter/Jupyter';
import { pause } from 'common/lib/utilities/misc';

interface IState {
  runnerLastUpdated: number;
  customFunctionsSolutionLastModified: number;

  isStandalone: boolean;

  logs: ILogData[];
  error?: Error;

  // Optional, since cannot be immediately determined in the constructor
  engineStatus?: ICustomFunctionEngineStatus;
  customFunctionsSummaryItems?: Array<ICustomFunctionParseResult<any>>;
  customFunctionsCode?: string;
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

      this.state = {
        runnerLastUpdated: Date.now(),
        customFunctionsSolutionLastModified: getCFCodeLastModified(),
        isStandalone: !queryString.parse(window.location.href.split('?').slice(-1)[0])
          .backButton,
        logs: [],
      };
    }

    async componentDidMount() {
      const engineStatus = await getCustomFunctionEngineStatusSafe();

      const cfSolutions = getCustomFunctionsSolutions();
      const registrationResult = await getRegistrationResult(cfSolutions);
      this.setState({
        engineStatus: engineStatus,
        customFunctionsSummaryItems: registrationResult.parseResults,
        customFunctionsCode: registrationResult.code,
      });

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
      } finally {
        hideSplashScreen();
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

async function getRegistrationResult(
  cfSolutions: ISolution[],
): Promise<{ parseResults: Array<ICustomFunctionParseResult<IFunction>>; code: string }> {
  const hasPython = cfSolutions
    .map(solution => findScript(solution))
    .find(script => script.language === 'python');

  if (hasPython) {
    return getRegistrationResultPython();
  } else {
    return getCustomFunctionsInfoForRegistration(cfSolutions);
  }
}

async function getRegistrationResultPython(): Promise<{
  parseResults: Array<ICustomFunctionParseResult<IFunction>>;
  code: string;
}> {
  const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  const [url, token, notebookName] = ['jupyter.url', 'jupyter.token', 'jupyter.notebook']
    .map(settingName => ({
      name: settingName,
      value: userSettings[settingName],
    }))
    .map(pair => {
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
      return pair.value;
    });

  const notebook = new JupyterNotebook({ baseUrl: url, token: token }, notebookName);
  await notebook.ensureConnected();

  return { code: '', parseResults: [] };
}
