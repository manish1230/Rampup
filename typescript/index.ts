// //generics

// interface Storage1<T> {
//     add(item: T): void;
//     getAll(): T[];
//   }

//   class MemoryStorage<T> implements Storage1<T> {
//     private items: T[] = [];
  
//     add(item: T): void {
//       this.items.push(item);
//     }
  
//     getAll(): T[] {
//       return this.items;
//     }
//   }

//   // Define a custom type
// interface User {
//     id: number;
//     name: string;
//   }
    
//   const numberStorage = new MemoryStorage<number>();
// numberStorage.add(1);
// numberStorage.add(2);
// console.log(numberStorage.getAll()); // [1, 2]

// const stringStorage = new MemoryStorage<string>();
// stringStorage.add("Hello");
// stringStorage.add("World");
// console.log(stringStorage.getAll()); // ["Hello", "World"]


// // Use generic class with User type
// const userStorage = new MemoryStorage<User>();

// userStorage.add({ id: 1, name: "Alice" });
// userStorage.add({ id: 2, name: "Bob" });

// console.log(userStorage.getAll());
// // Output: [ { id: 1, name: "Alice" }, { id: 2, name: "Bob" } ]





// // mapped type

// // 1.Making All Properties Optional
// interface User {
//     name: string;
//     age: number;
//     email: string;
//   }
  
//   // Creating a mapped type to make all properties optional
//   type Optional<T> = {
//     [K in keyof T]?: T[K];
//   }
  
//   type OptionalUser = Optional<User>;
  
//   const user1: OptionalUser = {}; // All properties are optional now
//   const user2: OptionalUser = { name: "Alice" }; // Only the name property
//   const user3: OptionalUser = { name: "Bob", email: "bob@example.com" }; // Partial properties
  // console.log(user3);




// //2: Making All Properties Readonly
//   interface Product {
//     id: number;
//     name: string;
//     price: number;
//   }
  
//   // Creating a mapped type to make all properties readonly
//   type ReadonlyProduct<T> = {
//     readonly [K in keyof T]: T[K];
//   }
  
//   type ReadonlyProductType = ReadonlyProduct<Product>;
  
//   const product: ReadonlyProductType = {
//     id: 1,
//     name: "Laptop",
//     price: 1000
//   };
  
//   product.price = 900; // Error: Cannot assign to 'price' because it is a read-only property
  


// //3: Changing Property Types
// interface Car {
//     make: string;
//     model: string;
//     year: number;
//   }
  
//   // Creating a mapped type to convert all properties to strings
//   type Stringify<T> = {
//     [K in keyof T]: string;
//   }
  
//   type StringifiedCar = Stringify<Car>;
  
//   const car: StringifiedCar = {
//     make: "Toyota",
//     model: "Corolla",
//     year: "2020" // Now all properties are strings
//   };
// console.log(car);
  




// //4: Conditional Mapped Types (Transforming Based on Type)
// interface Employee {
//     name: string;
//     age: number;
//     department: string;
//   }
  
//   type ToString<T> = {
//     [K in keyof T]: T[K] extends string ? string : number; // If it's string, keep it as string, otherwise convert to number
//   }
  
//   type EmployeeAsStrings = ToString<Employee>;
  
//   const employee: EmployeeAsStrings = {
//     name: "John",
//     age: 30, // age is now a number
//     department: "HR"
//   };
  
//   console.log(employee);





// implementation of deepPartial

interface Product {
    id: number;
    name: string;
    price: number;
    details: {
      manufacturer: string;
      stock: {
        available: boolean;
        quantity: number;
      };
    };
    log(): void;
  }

  type DeepPartial<T> = {
    [P in keyof T]?: 
      T[P] extends object
        ? T[P] extends Function
          ? T[P]           
          : DeepPartial<T[P]>  
        : T[P];            
  };

  const partialProduct: DeepPartial<Product> = {
    name: "Notebook", // ✅ optional
    details: {
      stock: {
        available: true // ✅ nested optional
      }
    },
    log: () => console.log("Logging product") // ✅ functions are untouched
  };
  
  console.log(partialProduct);