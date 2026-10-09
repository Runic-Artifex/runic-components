import type { Component } from "vue";
export interface DocumentTab {
  id: string;
  title: string;
  dirty?: boolean;
  icon?: Component;
}
