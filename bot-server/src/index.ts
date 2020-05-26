import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { Routes } from './routes';
import { User } from './entity/User';

const port =
  process.env.PORT ||
  (() => {
    throw new Error('Must set the PORT environment variable');
  })();

createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next,
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined,
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        },
      );
    });

    app.listen(port);

    // insert new users for test
    await connection.manager.save(
      (() => {
        const user = new User();

        user.username = 'Timber';
        user.boids = [];

        return user;
      })(),
    );
    await connection.manager.save(
      (() => {
        const user = new User();

        user.username = 'Phantom';
        user.boids = [];

        return user;
      })(),
    );

    console.log(
      `Express server has started on port ${port}. Open http://localhost:${port}/users to see results`,
    );
  })
  .catch((error) => console.log(error));
