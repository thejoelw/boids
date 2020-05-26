import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from './User';
import { BoidVersion } from './BoidVersion';

@Entity()
export class Boid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne((type) => User, (user) => user.boids)
  owner: User;

  @OneToMany((type) => BoidVersion, (boidVersion) => boidVersion.boid)
  versions: BoidVersion[];
}
