export interface MathButton {
  label: string
  latex: string
  tooltip: string
}

export interface MathGroup {
  id: string
  label: string
  buttons: MathButton[]
}

/** Insert `#0` marks the first placeholder cursor lands in after insert. */
export const MATH_GROUPS: MathGroup[] = [
  {
    id: 'fractions',
    label: 'Дроби',
    buttons: [
      { label: '𝑎/𝑏', latex: '\\frac{#0}{#?}', tooltip: 'Дробь' },
      { label: 'n 𝑎/𝑏', latex: '#0\\frac{#?}{#?}', tooltip: 'Смешанная дробь' },
    ],
  },
  {
    id: 'powers',
    label: 'Степени',
    buttons: [
      { label: 'xⁿ', latex: '#0^{#?}', tooltip: 'Степень' },
      { label: 'xₙ', latex: '#0_{#?}', tooltip: 'Индекс' },
    ],
  },
  {
    id: 'roots',
    label: 'Корни',
    buttons: [
      { label: '√', latex: '\\sqrt{#0}', tooltip: 'Квадратный корень' },
      { label: 'ⁿ√', latex: '\\sqrt[#?]{#0}', tooltip: 'Корень n-й степени' },
    ],
  },
  {
    id: 'ops',
    label: 'Операции',
    buttons: [
      { label: '×', latex: '\\times', tooltip: 'Умножение' },
      { label: '÷', latex: '\\div', tooltip: 'Деление' },
      { label: '±', latex: '\\pm', tooltip: 'Плюс-минус' },
      { label: '∓', latex: '\\mp', tooltip: 'Минус-плюс' },
      { label: '·', latex: '\\cdot', tooltip: 'Точка' },
    ],
  },
  {
    id: 'compare',
    label: 'Сравнение',
    buttons: [
      { label: '≤', latex: '\\le', tooltip: 'Меньше или равно' },
      { label: '≥', latex: '\\ge', tooltip: 'Больше или равно' },
      { label: '≠', latex: '\\ne', tooltip: 'Не равно' },
      { label: '≈', latex: '\\approx', tooltip: 'Приближённо' },
      { label: '≡', latex: '\\equiv', tooltip: 'Тождественно' },
    ],
  },
  {
    id: 'brackets',
    label: 'Скобки',
    buttons: [
      { label: '( )', latex: '\\left(#0\\right)', tooltip: 'Круглые' },
      { label: '[ ]', latex: '\\left[#0\\right]', tooltip: 'Квадратные' },
      { label: '{ }', latex: '\\left\\{#0\\right\\}', tooltip: 'Фигурные' },
      { label: '| |', latex: '\\left|#0\\right|', tooltip: 'Модуль' },
    ],
  },
  {
    id: 'functions',
    label: 'Функции',
    buttons: [
      { label: 'sin', latex: '\\sin', tooltip: 'Синус' },
      { label: 'cos', latex: '\\cos', tooltip: 'Косинус' },
      { label: 'tg', latex: '\\tan', tooltip: 'Тангенс' },
      { label: 'ctg', latex: '\\cot', tooltip: 'Котангенс' },
      { label: 'log', latex: '\\log', tooltip: 'Логарифм' },
      { label: 'ln', latex: '\\ln', tooltip: 'Натуральный логарифм' },
      { label: 'lg', latex: '\\lg', tooltip: 'Десятичный логарифм' },
    ],
  },
  {
    id: 'calculus',
    label: 'Матан',
    buttons: [
      { label: '∑', latex: '\\sum_{#0}^{#?}', tooltip: 'Сумма' },
      { label: '∏', latex: '\\prod_{#0}^{#?}', tooltip: 'Произведение' },
      { label: '∫', latex: '\\int_{#0}^{#?}', tooltip: 'Интеграл' },
      { label: 'lim', latex: '\\lim_{#0}', tooltip: 'Предел' },
      { label: '∞', latex: '\\infty', tooltip: 'Бесконечность' },
    ],
  },
  {
    id: 'geometry',
    label: 'Геометрия',
    buttons: [
      { label: '°', latex: '^\\circ', tooltip: 'Градус' },
      { label: '∠', latex: '\\angle', tooltip: 'Угол' },
      { label: '△', latex: '\\triangle', tooltip: 'Треугольник' },
      { label: '∥', latex: '\\parallel', tooltip: 'Параллельно' },
      { label: '⊥', latex: '\\perp', tooltip: 'Перпендикулярно' },
      { label: '~', latex: '\\sim', tooltip: 'Подобно' },
    ],
  },
  {
    id: 'greek',
    label: 'Греческие',
    buttons: [
      { label: 'π', latex: '\\pi', tooltip: 'пи' },
      { label: 'α', latex: '\\alpha', tooltip: 'альфа' },
      { label: 'β', latex: '\\beta', tooltip: 'бета' },
      { label: 'γ', latex: '\\gamma', tooltip: 'гамма' },
      { label: 'θ', latex: '\\theta', tooltip: 'тета' },
      { label: 'φ', latex: '\\varphi', tooltip: 'фи' },
      { label: 'Δ', latex: '\\Delta', tooltip: 'дельта' },
      { label: 'Ω', latex: '\\Omega', tooltip: 'омега' },
    ],
  },
  {
    id: 'sets',
    label: 'Множества',
    buttons: [
      { label: '∈', latex: '\\in', tooltip: 'Принадлежит' },
      { label: '∉', latex: '\\notin', tooltip: 'Не принадлежит' },
      { label: '⊂', latex: '\\subset', tooltip: 'Подмножество' },
      { label: '∪', latex: '\\cup', tooltip: 'Объединение' },
      { label: '∩', latex: '\\cap', tooltip: 'Пересечение' },
      { label: '∅', latex: '\\emptyset', tooltip: 'Пустое множество' },
      { label: 'ℝ', latex: '\\mathbb{R}', tooltip: 'Действительные' },
      { label: 'ℕ', latex: '\\mathbb{N}', tooltip: 'Натуральные' },
      { label: 'ℤ', latex: '\\mathbb{Z}', tooltip: 'Целые' },
    ],
  },
  {
    id: 'arrows',
    label: 'Стрелки',
    buttons: [
      { label: '→', latex: '\\to', tooltip: 'Стрелка' },
      { label: '⇒', latex: '\\Rightarrow', tooltip: 'Следует' },
      { label: '⇔', latex: '\\Leftrightarrow', tooltip: 'Равносильно' },
    ],
  },
  {
    id: 'matrix',
    label: 'Матрицы',
    buttons: [
      {
        label: '(2×2)',
        latex: '\\begin{pmatrix}#0 & #? \\\\ #? & #?\\end{pmatrix}',
        tooltip: 'Матрица 2×2',
      },
      {
        label: '(3×3)',
        latex: '\\begin{pmatrix}#0 & #? & #? \\\\ #? & #? & #? \\\\ #? & #? & #?\\end{pmatrix}',
        tooltip: 'Матрица 3×3',
      },
      {
        label: 'cases',
        latex: '\\begin{cases}#0 \\\\ #?\\end{cases}',
        tooltip: 'Система уравнений',
      },
    ],
  },
  {
    id: 'misc',
    label: 'Прочее',
    buttons: [
      { label: 'vec', latex: '\\vec{#0}', tooltip: 'Вектор' },
      { label: 'x̄', latex: '\\overline{#0}', tooltip: 'Среднее / черта сверху' },
      { label: '|x|', latex: '\\left|#0\\right|', tooltip: 'Модуль' },
    ],
  },
]

export interface MathTemplate {
  label: string
  latex: string
}

export const MATH_TEMPLATES: MathTemplate[] = [
  { label: 'Квадратное уравнение', latex: 'a x^2 + b x + c = 0' },
  { label: 'Дискриминант', latex: 'D = b^2 - 4ac' },
  { label: 'Теорема Пифагора', latex: 'a^2 + b^2 = c^2' },
  {
    label: 'Система из двух уравнений',
    latex: '\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}',
  },
  { label: 'Дробь с переменными', latex: '\\frac{x + a}{x - b}' },
  { label: 'Процент', latex: '\\frac{x}{100} \\cdot y' },
  { label: 'Прогрессия', latex: 'a_n = a_1 + (n - 1) d' },
]
