import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('boolean', {
    default: true,
  })
  isActive: boolean;

  @Column('simple-array', {
    default: 'USER',
  })
  roles: string[];

  @OneToMany(() => Product, (product) => product.user)
  product: Product[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    // this.password = bcrypt.hashSync(this.password, +process.env.ROUNDS);
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
