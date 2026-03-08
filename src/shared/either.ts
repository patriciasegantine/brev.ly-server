export type Either<L, R> = Left<L> | Right<R>;

class Left<L> {
  readonly tag = 'left';
  constructor(readonly value: L) {}
}

class Right<R> {
  readonly tag = 'right';
  constructor(readonly value: R) {}
}

export function makeLeft<L>(value: L): Either<L, never> {
  return new Left(value);
}

export function makeRight<R>(value: R): Either<never, R> {
  return new Right(value);
}

export function isLeft<L, R>(either: Either<L, R>): either is Left<L> {
  return either.tag === 'left';
}

export function isRight<L, R>(either: Either<L, R>): either is Right<R> {
  return either.tag === 'right';
}
