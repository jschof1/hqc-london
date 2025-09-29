export interface Testimonial {
  name: string;
  avatar: string;
  avatarAlt: string;
  title: string;
  quote: string;
  subtitle: string;
  rating: number;
}

export interface Props {
  headerText?: string;
  testimonials?: Testimonial[];
  className?: string;
  backgroundColor?: string;
  ariaLabel?: string;
}

