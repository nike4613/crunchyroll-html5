declare global {
  interface ObjectConstructor {
    values(obj: Object): any[];
  }
}

Object.values = Object.values || function values(obj: {[key:string]:any}): any[] {
  return Object.getOwnPropertyNames(obj).map((k: string): any => obj[k]);
}

// needed so typescript recognises this as a module
export default undefined;