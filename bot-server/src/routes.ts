import { UserController } from './controller/UserController';
import { BoidVersionController } from './controller/BoidVersionController';

export const Routes = [
  {
    method: 'get',
    route: '/users',
    controller: UserController,
    action: 'all',
  },
  {
    method: 'get',
    route: '/users/:id',
    controller: UserController,
    action: 'one',
  },
  {
    method: 'post',
    route: '/users',
    controller: UserController,
    action: 'save',
  },
  {
    method: 'delete',
    route: '/users/:id',
    controller: UserController,
    action: 'remove',
  },

  {
    method: 'get',
    route: '/boidversions',
    controller: BoidVersionController,
    action: 'allPublished',
  },
  {
    method: 'post',
    route: '/boidversions',
    controller: BoidVersionController,
    action: 'save',
  },
];
