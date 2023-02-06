import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...productDetails } = createProductDto;

    try {
      // Add images to the current product ( no need to pass the product.id )
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((imageUrl) =>
          this.productImageRepository.create({ url: imageUrl }),
        ),
      });
      await this.productRepository.save(product);

      // Spread operator to don't show the images id
      return { ...product, images };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        // relations: {
        //   images: true
        // }
      });
      return products.map(({ images, ...product }) => ({
        ...product,
        images: images.map((image) => image.url),
      }));
    } catch (error) {
      throw new NotFoundException('Products not found.');
    }
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
      this.logger.log(`Product by UUID: ${term}`);
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('p');
      product = await queryBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('p.images', 'pImages')
        .getOne();
      this.logger.log(`Product by title/slug: ${term}`);
    }

    if (!product) throw new NotFoundException(`Product not found.`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);
    return {
      ...product,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...newProductProperties } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...newProductProperties,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found.`);

    // Create query runner (Transaction)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Delete the previous images from the DB
        await queryRunner.manager.delete(ProductImage, { product: id });
        // Add the images from the DTO to the product to update
        product.images = images.map((imgUrl) =>
          this.productImageRepository.create({ url: imgUrl }),
        );
      }

      // Save the product but it's not done until the transaction is committed
      await queryRunner.manager.save(product);

      // Commit the transaction to make changes in the db
      await queryRunner.commitTransaction();

      // End db conex
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDbExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.delete(id);
    return {
      message: `The product with id ${id} was successfully removed.`,
    };
  }

  private handleDbExceptions(error: any) {
    if (['23502', '23505'].includes(error.code))
      throw new BadRequestException(`${error.detail}`);
    this.logger.error(error);
    throw new InternalServerErrorException('Error creating the product');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder();
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }
}
