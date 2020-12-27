import YAML from "yaml";
import { getFileSource, getFileUrl } from "./fileUtils";
import logo from "./logo.svg";


export interface Config {
  title?: string;
  mainUrl?: string;
  styleUrl?: string;
  logoUrl?: string;
  navigationUrl?: string;
  preloadMessage?: string;
  hideLogo?: boolean;
  hideNavigationMenu?: boolean;
  hideHeadersMenu?: boolean;
  hideCredits?: boolean;
}

const defaultConfig: Config = {
  title: "MarkReader",
  mainUrl: "./index.md",
  styleUrl: null,
  navigationUrl: "./navigation.yaml",
  logoUrl: logo,
  hideLogo: false,
  preloadMessage: "Loading…"
};


export const config: Config = Object.assign({}, defaultConfig);

export const loadConfig = async (): Promise<Config> => {
  const url          = getFileUrl("config.yaml");
  const source       = await getFileSource(url);
  const customConfig = YAML.parse(source) as Config;
  if(customConfig) {
    Object.assign(config, customConfig);
  }
  return config;
};

export interface NavigationItem {
  label: string;
  file: string;
  children: NavigationItem[];
}

let navigationItems: NavigationItem[];

export const getNavigationItems = async (config: Config): Promise<NavigationItem[]> => {
  if(!navigationItems) {
    const url       = getFileUrl(config.navigationUrl);
    const source    = await getFileSource(url);
    navigationItems = YAML.parse(source) as NavigationItem[];
  }
  return navigationItems;
};

export const getLogoUrl = (): string => {
  const logoPath = config.logoUrl;
  if(logoPath.match(/^data:/)) {
    return logoPath;
  }
  return getFileUrl(logoPath);
};
