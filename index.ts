import 'reflect-metadata';

/**
 * Decorator
 */
function Injectable() {
  const generateToken = () => {
    const letters =
      'yxcvbnmlkjhgfdsaqwertzuopYXCVBNMLKJHGFDSAQWERTZUIOP0123456789';
    let out = '';
    for (let i = 0; i < 32; ++i) {
      out += letters.charAt(Math.random() * letters.length);
    }
    return out;
  };
  return function <T>(target: new (...args: any[]) => T) {
    Reflect.defineMetadata('di:injection-token', generateToken(), target);
  };
}

/**
 * Injector
 */
class Injector {
  private static map: Map<string, Object> = new Map();
  public static inject<T>(target: new (...args: any[]) => T): T {
    /**
     * Resolve injection token
     */
    const injectionTokenForType =
      Reflect.getMetadata('di:injection-token', target) ?? null;
    if (!injectionTokenForType)
      throw new Error(
        `'${target.name.toString()}' is not an injectable type. Did you forget 'Injectable' decorator?.`
      );

    /**
     * Check if there already is an instance
     */
    if (Injector.map.has(injectionTokenForType))
      return Injector.map.get(injectionTokenForType) as T;

    /**
     * Otherwise start resolving it
     */
    const dependencies: (new (...args: any[]) => Object)[] =
      Reflect.getMetadata('design:paramtypes', target);
    console.log(dependencies);

    return null;
  }
}

class Service1 {}

@Injectable()
class MyService {
  constructor(public service: Service1) {}
}

const test = Injector.inject<MyService>(MyService);

/*

export default (constructor: any) => {
  const functionString = constructor.toString();
  const params = GetArgumentNames(functionString);
  
  const newConstructor: any = function (...args) {
      const newObj = new constructor(args);
      params.map((param, index) => newObj[param] = args[index]);    
      return newObj;
  }

  newConstructor.prototype = constructor.prototype;
  return newConstructor;
}
*/
