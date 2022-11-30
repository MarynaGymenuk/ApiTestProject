import {faker} from '@faker-js/faker';

export const user = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  age: faker.datatype.number({min: 18, max: 80}),
} 
