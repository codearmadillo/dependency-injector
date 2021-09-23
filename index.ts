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
    Reflect.defineMetadata(
      'di:injection-token',
      `${target.name}_${generateToken()}`,
      target
    );
  };
}

/**
 * Injector
 */
class Injector {
  private map: Map<string, Object>;
  private static _instance: Injector;
  private constructor() {
    this.map = new Map();
  }
  public static getInstance(): Injector {
    if (!Injector._instance) Injector._instance = new Injector();
    return Injector._instance;
  }
  public inject<T>(target: new (...args: any[]) => T): T {
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
     * Resolve if it doesnt exist
     */
    if (!this.map.has(injectionTokenForType)) {
      const factories: (new (...args: any[]) => Object)[] =
        Reflect.getMetadata('design:paramtypes', target) ?? [];
      const dependencies = factories.map((factory) => {
        return Injector.getInstance().inject(factory);
      });
      this.map.set(injectionTokenForType, new target(...dependencies));
    }

    /**
     * Return
     */
    return (this.map.get(injectionTokenForType) as T) ?? null;
  }
}

@Injectable()
class Service3 {
  public foo: string = 'ghi';
}

@Injectable()
class Service2 {
  public foo: string = 'def';
  constructor(public service: Service3) {}
}

@Injectable()
class Service1 {
  public foo: string = 'abc';
  constructor(public service: Service2) {}
}

@Injectable()
class MyService {
  constructor(public service: Service1) {}
}

const a = Injector.getInstance().inject(MyService);
console.log(a);
