import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

@ValidatorConstraint({ name: 'isGSTNumber', async: false })
export class IsGSTNumberConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return GST_REGEX.test(value);
  }

  defaultMessage(): string {
    return 'GST number must be a valid 15-character GSTIN (e.g., 27AABCS1429B1Z5)';
  }
}

export function IsGSTNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsGSTNumberConstraint,
    });
  };
}
