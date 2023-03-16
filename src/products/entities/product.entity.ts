import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    description: 'Product id',
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Mens White T-Shirt',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  title: string;

  @ApiProperty({
    description: 'Product price',
    example: 9.5,
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    description: 'Product description',
    example: 'Designed for style and comfort..',
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: 'Product slug',
    example: 'mens_white_t_shirt',
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    description: 'Product stock',
    example: 10,
    default: 0,
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    description: 'Product sizes',
    example: ['M', 'L', 'XL'],
    uniqueItems: true,
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    description: 'Product gender',
    example: 'women',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, {
    eager: true,
  })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) this.slug = this.title;
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
