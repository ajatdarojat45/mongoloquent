import { ObjectId } from "mongodb";

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const clonedArray: any[] = [];
    for (const item of obj) {
      clonedArray.push(deepClone(item));
    }
    return clonedArray as any;
  }

  // Handle MongoDB ObjectId
  if (obj instanceof ObjectId) {
    return new ObjectId(obj.toHexString()) as any;
  }

  // Handle Object
  const clone: Partial<T> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone as T;
}
