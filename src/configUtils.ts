import YAML from "yaml";
import { getFileSource, getFileUrl } from "./fileUtils";
import logo from "./logo.svg";

export interface NavigationItem {
  label: string;
  file: string;
  children: NavigationItem[];
}
export interface Config {
  title?: string;
  mainUrl?: string;
  styleUrl?: string;
  logoUrl?: string;
  preloadMessage?: string;
  errorMessage?: string;
  hideLogo?: boolean;
  hideNavigationMenu?: boolean;
  hideHeadersMenu?: boolean;
  hideCredits?: boolean;
  navigation?: NavigationItem[];
}

const defaultConfig: Config = {
  title: "MarkReader",
  mainUrl: "./index.md",
  styleUrl: null,
  logoUrl: logo,
  preloadMessage: "Please wait, loading the page …",
  errorMessage: "Error, please reload the page to try again.",
  hideLogo: false,
  hideNavigationMenu: false,
  hideHeadersMenu: false,
  hideCredits: false,
  navigation: null
};


export const config: Config = Object.assign({}, defaultConfig);

export const loadConfig = async (): Promise<Config> => {
  const url          = getFileUrl("./config.yaml");
  const source       = await getFileSource(url);
  const customConfig = YAML.parse(source) as Config;
  if(customConfig) {
    Object.assign(config, customConfig);
  }
  return config;
};

export const getNavigationItems = async (config: Config): Promise<NavigationItem[]> => {
  return config.navigation;
};

export const getLogoUrl = (): string => {
  const logoPath = config.logoUrl;
  if(logoPath.match(/^data:/)) {
    return logoPath;
  }
  return getFileUrl(logoPath);
};
