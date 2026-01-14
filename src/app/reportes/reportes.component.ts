import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ReportesService } from '../services/reportes.service';
import { ApiResponse } from '../services/api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit, AfterViewInit {

  // Opciones de período
  periodos = [
    { label: 'Últimos 7 días', value: 'dia' },
    { label: 'Este mes', value: 'mes' },
    { label: 'Este año', value: 'anio' }
  ];

  // Opciones de tipo de reporte
  tiposReporte = [
    { label: 'Ventas por período', value: 'ventas' },
    { label: 'Cantidad de prendas', value: 'cantidad' }
  ];

  // Filtros seleccionados
  periodoSeleccionado = 'mes';
  tipoReporteSeleccionado = 'ventas';
  anioSeleccionado = new Date().getFullYear();
  mesSeleccionado = new Date().getMonth() + 1;

  // Gráfico de barras
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  // Gráfico de líneas
  @ViewChild('tendenciaCanvas') tendenciaCanvas!: ElementRef<HTMLCanvasElement>;
  private tendenciaChart: Chart | null = null;

  // Gráfico circular
  @ViewChild('categoriaCanvas') categoriaCanvas!: ElementRef<HTMLCanvasElement>;
  private categoriaChart: Chart | null = null;

  // Gráfico de barras horizontales
  @ViewChild('topProductosCanvas') topProductosCanvas!: ElementRef<HTMLCanvasElement>;
  private topProductosChart: Chart | null = null;

  // Gráfico de stock
  @ViewChild('stockCanvas') stockCanvas!: ElementRef<HTMLCanvasElement>;
  private stockChart: Chart | null = null;

  cargando = false;

  // Datos de ventas
  datosVentas: any[] = [];
  datosTendencia: any[] = [];
  datosMetodosPago: any[] = [];
  datosTopProductos: any[] = [];
  datosStock: any[] = [];

  // Datos para KPIs
  kpis: any = {
    ventasDia: 0,
    ventasMes: 0,
    productoTop: { nombre: '', cantidad: 0 },
    categoriaLider: { nombre: '', total: 0 },
    stockCritico: { nombre: '', stock: 0 }
  };

  constructor(
    private reportesService: ReportesService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Los gráficos se inicializarán cuando los datos estén listos
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;

    try {
      const params = {
        periodo: this.periodoSeleccionado === 'dia' ? 'semana' : this.periodoSeleccionado,
        anio: this.anioSeleccionado,
        mes: this.mesSeleccionado
      };

      // Cargar datos para gráfico de barras
      this.reportesService.getVentasPorPeriodo(params).subscribe({
        next: (response: ApiResponse<any[]>) => {
          if (response.success) {
            this.datosVentas = response.data || [];
            setTimeout(() => {
              this.inicializarGrafico();
            }, 100);
          }
        },
        error: (error: any) => {
          console.error('Error cargando datos de ventas:', error);
        }
      });

      // Cargar datos para gráfico de tendencia
      this.reportesService.getTendenciaVentas(params).subscribe({
        next: (response: ApiResponse<any[]>) => {
          if (response.success) {
            this.datosTendencia = response.data || [];
            setTimeout(() => {
              this.inicializarGraficoTendencia();
            }, 100);
          }
        },
        error: (error: any) => {
          console.error('Error cargando datos de tendencia:', error);
        }
      });

      // Cargar datos para gráfico de categorías
      this.reportesService.getVentasPorMetodoPago().subscribe({
        next: (response: ApiResponse<any[]>) => {
          if (response.success) {
            this.datosMetodosPago = response.data || [];
            setTimeout(() => {
              this.inicializarGraficoCategoria();
            }, 100);
          }
        },
        error: (error: any) => {
          console.error('Error cargando datos de métodos de pago:', error);
        }
      });

      // Cargar datos para gráfico de top productos
      this.reportesService.getTopProductos().subscribe({
        next: (response: ApiResponse<any[]>) => {
          console.log(' Top productos response:', response);
          if (response.success) {
            this.datosTopProductos = response.data || [];
            console.log('datosTopProductos:', this.datosTopProductos);
            setTimeout(() => {
              this.inicializarGraficoTopProductos();
            }, 100);
          }
        },
        error: (error: any) => {
          console.error('Error cargando datos de top productos:', error);
        }
      });

      // Cargar datos para gráfico de stock
      this.reportesService.getStockActual().subscribe({
        next: (response: ApiResponse<any[]>) => {
          console.log(' Stock response:', response);
          if (response.success) {
            this.datosStock = response.data || [];
            console.log(' datosStock:', this.datosStock);
            console.log(' Total productos:', this.datosStock.length);
            setTimeout(() => {
              this.inicializarGraficoStock();
            }, 100);
          } else {
            console.log('Stock response sin success:', response);
          }
        },
        error: (error: any) => {
          console.error('Error cargando datos de stock:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
        },
        complete: () => {
          console.log('Stock request completed');
          this.calcularKPIs();
          this.cargando = false;
        }
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.cargando = false;
    }
  }

  calcularKPIs(): void {
    console.log('Calculando KPIs...');

    // 1. Ventas del día
    const hoy = new Date().toISOString().split('T')[0];
    const ventasDia = this.datosVentas.filter(v =>
      new Date(v.fecha).toISOString().split('T')[0] === hoy
    );
    this.kpis.ventasDia = ventasDia.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);

    // 2. Ventas del mes
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    const ventasMes = this.datosVentas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });
    this.kpis.ventasMes = ventasMes.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);

    // 3. Producto más vendido
    if (this.datosTopProductos && this.datosTopProductos.length > 0) {
      const topProducto = this.datosTopProductos[0];
      this.kpis.productoTop = {
        nombre: topProducto.nombre,
        cantidad: parseInt(topProducto.unidades_vendidas) || 0
      };
    }

    // 4. Categoría líder (basado en métodos de pago como proxy)
    if (this.datosMetodosPago && this.datosMetodosPago.length > 0) {
      const categoriaTop = this.datosMetodosPago[0];
      this.kpis.categoriaLider = {
        nombre: categoriaTop.metodo_pago,
        total: parseFloat(categoriaTop.total) || 0
      };
    }

    // 5. Stock crítico (productos con stock bajo o sin stock)
    if (this.datosStock && this.datosStock.length > 0) {
      const productosCriticos = this.datosStock
        .filter(p => p.activo && (parseInt(p.stock_actual) <= parseInt(p.stock_minimo)))
        .sort((a, b) => parseInt(a.stock_actual) - parseInt(b.stock_actual));

      if (productosCriticos.length > 0) {
        const critico = productosCriticos[0];
        this.kpis.stockCritico = {
          nombre: critico.nombre,
          stock: parseInt(critico.stock_actual) || 0
        };
      }
    }

    console.log('KPIs calculados:', this.kpis);
  }

  inicializarGraficoStock(): void {
    if (!this.stockCanvas) return;

    const ctx = this.stockCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico existente
    if (this.stockChart) {
      this.stockChart.destroy();
    }

    const datosGrafico = this.procesarDatosStock();

    this.stockChart = new Chart(ctx, {
      type: 'bar',
      data: datosGrafico,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#212529',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: ' Inventario Actual',
            color: '#212529',
            font: {
              size: 20,
              weight: 'bold' as const
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                const stockMinimo = context.dataset.stockMinimos?.[context.dataIndex] || 0;
                return `${label}: ${value} unidades (Mínimo: ${stockMinimo})`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6C757D',
              callback: (value: any) => {
                return value + ' unid.';
              }
            },
            grid: {
              color: '#E9ECEF'
            }
          },
          x: {
            ticks: {
              color: '#212529',
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  procesarDatosStock(): any {
    console.log('procesarDatosStock - datosStock:', this.datosStock);

    if (!this.datosStock || this.datosStock.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Stock',
          data: [0],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2
        }]
      };
    }

    // Filtrar solo productos activos y ordenar por stock actual
    const productosActivos = this.datosStock.filter((item: any) => item.activo);

    // Ordenar por stock actual y tomar los top 10
    const productosOrdenados = productosActivos
      .sort((a, b) => parseInt(b.stock_actual) - parseInt(a.stock_actual))
      .slice(0, 10);

    console.log('Productos ordenados:', productosOrdenados);

    const labels = productosOrdenados.map((item: any) => item.nombre);
    const data = productosOrdenados.map((item: any) => parseInt(item.stock_actual) || 0);
    const stockMinimos = productosOrdenados.map((item: any) => parseInt(item.stock_minimo) || 0);

    console.log('Stock Labels:', labels);
    console.log('Stock Data:', data);
    console.log('Stock Mínimos:', stockMinimos);

    // Asignar colores según nivel de stock con colores alucinantes
    const colores = data.map((stock, index) => {
      const minimo = stockMinimos[index];
      if (stock === 0) {
        return 'rgba(220, 38, 38, 0.8)'; // Rojo con transparencia
      } else if (stock <= minimo) {
        return 'rgba(245, 158, 11, 0.8)'; // Amarillo con transparencia
      } else if (stock <= minimo * 2) {
        return 'rgba(16, 185, 129, 0.8)'; // Verde con transparencia
      } else {
        return 'rgba(139, 92, 246, 0.8)'; // Lila con transparencia
      }
    });

    const coloresBorde = data.map((stock, index) => {
      const minimo = stockMinimos[index];
      if (stock === 0) {
        return 'rgba(220, 38, 38, 1)'; // Rojo sólido
      } else if (stock <= minimo) {
        return 'rgba(245, 158, 11, 1)'; // Amarillo sólido
      } else if (stock <= minimo * 2) {
        return 'rgba(16, 185, 129, 1)'; // Verde sólido
      } else {
        return 'rgba(139, 92, 246, 1)'; // Lila sólido
      }
    });

    return {
      labels: labels,
      datasets: [{
        label: 'Stock Actual',
        data: data,
        backgroundColor: colores,
        borderColor: coloresBorde,
        borderWidth: 2,
        hoverBackgroundColor: coloresBorde,
        hoverBorderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        stockMinimos: stockMinimos // Guardar para tooltips
      }]
    };
  }

  inicializarGraficoTopProductos(): void {
    if (!this.topProductosCanvas) return;

    const ctx = this.topProductosCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico existente
    if (this.topProductosChart) {
      this.topProductosChart.destroy();
    }

    const datosGrafico = this.procesarDatosTopProductos();

    this.topProductosChart = new Chart(ctx, {
      type: 'bar',
      data: datosGrafico,
      options: {
        indexAxis: 'y', // Barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Top Productos Más Vendidos',
            color: '#212529',
            font: {
              size: 20,
              weight: 'bold' as const
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.x;
                return `${label}: ${value} unidades`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#6C757D',
              callback: (value: any) => {
                return value + ' unid.';
              }
            },
            grid: {
              color: '#E9ECEF'
            }
          },
          y: {
            ticks: {
              color: '#212529',
              font: {
                size: 12
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  procesarDatosTopProductos(): any {
    console.log('procesarDatosTopProductos - datosTopProductos:', this.datosTopProductos);

    if (!this.datosTopProductos || this.datosTopProductos.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Unidades',
          data: [0],
          backgroundColor: '#8B5CF6',
          borderColor: '#7C3AED',
          borderWidth: 1
        }]
      };
    }

    // Ordenar por cantidad vendida y tomar los top 10
    const topProductos = [...this.datosTopProductos]
      .sort((a, b) => parseFloat(b.unidades_vendidas) - parseFloat(a.unidades_vendidas))
      .slice(0, 10);

    console.log('Top productos ordenados:', topProductos);

    const labels = topProductos.map((item: any) => item.nombre);
    const data = topProductos.map((item: any) => parseFloat(item.unidades_vendidas) || 0);

    console.log('Labels:', labels);
    console.log('Data:', data);

    // Colores lila-azul-rosado para cada producto
    const colores = [
      '#8B5CF6', '#3B82F6', '#EC4899', '#A78BFA', '#60A5FA',
      '#F472B6', '#C084FC', '#93C5FD', '#DDD6FE', '#FBBF24'
    ];

    return {
      labels: labels,
      datasets: [{
        label: 'Unidades',
        data: data,
        backgroundColor: colores.slice(0, labels.length),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        borderRadius: 4
      }]
    };
  }

  inicializarGraficoCategoria(): void {
    if (!this.categoriaCanvas) return;

    const ctx = this.categoriaCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico existente
    if (this.categoriaChart) {
      this.categoriaChart.destroy();
    }

    const datosGrafico = this.procesarDatosCategoria();

    this.categoriaChart = new Chart(ctx, {
      type: 'pie',
      data: datosGrafico,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#212529',
              font: {
                size: 13,
                weight: 'normal' as const
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels && data.datasets.length > 0) {
                  const dataset = data.datasets[0];
                  const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);

                  return data.labels.map((label: string, i: number) => {
                    const value = dataset.data[i];
                    const percentage = ((value / total) * 100).toFixed(1);
                    return {
                      text: `${label} ${percentage}%`,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: '#FFFFFF',
                      lineWidth: 2,
                      pointStyle: 'circle',
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          title: {
            display: true,
            text: 'Ventas por Método de Pago',
            color: '#212529',
            font: {
              size: 20,
              weight: 'bold' as const
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: $${this.formatearNumero(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  procesarDatosCategoria(): any {
    if (!this.datosMetodosPago || this.datosMetodosPago.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          data: [1],
          backgroundColor: ['#8B5CF6'],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      };
    }

    const labels = this.datosMetodosPago.map((item: any) => item.metodo_pago);
    const data = this.datosMetodosPago.map((item: any) => parseFloat(item.total.toString()) || 0);

    // Colores lila-azul-rosado para cada método de pago
    const colores = [
      '#8B5CF6', // Lila púrpura
      '#3B82F6', // Azul brillante
      '#EC4899', // Rosa fucsia
      '#A78BFA', // Lila claro
      '#60A5FA', // Azul cielo
      '#F472B6', // Rosa vivo
      '#C084FC', // Lila suave
      '#93C5FD'  // Azul suave
    ];

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colores.slice(0, labels.length),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8,
        hoverBorderWidth: 3,
        spacing: 2,
        borderRadius: 4
      }]
    };
  }

  inicializarGrafico(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico existente
    if (this.chart) {
      this.chart.destroy();
    }

    const datosGrafico = this.procesarDatosGrafico();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: datosGrafico,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#212529',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Ventas por Período',
            color: '#212529',
            font: {
              size: 20,
              weight: 'bold' as const
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (this.tipoReporteSeleccionado === 'ventas') {
                  label += '$' + this.formatearNumero(context.parsed.y);
                } else {
                  label += context.parsed.y + ' prendas';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6C757D',
              callback: (value: any) => {
                if (this.tipoReporteSeleccionado === 'ventas') {
                  return '$' + this.formatearNumero(value);
                }
                return value;
              }
            },
            grid: {
              color: '#E9ECEF'
            }
          },
          x: {
            ticks: {
              color: '#6C757D'
            },
            grid: {
              color: '#E9ECEF'
            }
          }
        }
      }
    });
  }

  inicializarGraficoTendencia(): void {
    if (!this.tendenciaCanvas) return;

    const ctx = this.tendenciaCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico existente
    if (this.tendenciaChart) {
      this.tendenciaChart.destroy();
    }

    const datosGrafico = this.procesarDatosTendencia();

    this.tendenciaChart = new Chart(ctx, {
      type: 'line',
      data: datosGrafico,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#212529',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Tendencia de Ventas',
            color: '#212529',
            font: {
              size: 20,
              weight: 'bold' as const
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += '$' + this.formatearNumero(context.parsed.y);
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6C757D',
              callback: (value: any) => {
                return '$' + this.formatearNumero(value);
              }
            },
            grid: {
              color: '#E9ECEF'
            }
          },
          x: {
            ticks: {
              color: '#6C757D'
            },
            grid: {
              color: '#E9ECEF'
            }
          }
        }
      }
    });
  }

  procesarDatosTendencia(): any {
    if (!this.datosTendencia || this.datosTendencia.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Ventas',
          data: [0],
          backgroundColor: 'rgba(255, 140, 0, 0.1)',
          borderColor: '#FF8C00',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      };
    }

    let labels: string[] = [];
    let data: number[] = [];

    if (this.periodoSeleccionado === 'anio') {
      // Para año, mostrar nombres de meses
      const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                           'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      // Crear array con todos los meses
      const mesesCompletos = Array.from({length: 12}, (_, i) => ({
        mes: i + 1,
        total: 0,
        cantidad_ventas: 0
      }));

      // Llenar con datos existentes
      this.datosTendencia.forEach(dato => {
        const index = dato.mes - 1;
        if (index >= 0 && index < 12) {
          mesesCompletos[index].total = dato.total;
          mesesCompletos[index].cantidad_ventas = dato.cantidad_ventas;
        }
      });

      labels = nombresMeses;
      data = mesesCompletos.map(mes => parseFloat(mes.total.toString()) || 0);
    } else {
      // Para día y semana, usar fechas
      const datosOrdenados = [...this.datosTendencia];

      labels = datosOrdenados.map(dato => {
        const fecha = new Date(dato.fecha);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      });

      data = datosOrdenados.map(dato => parseFloat(dato.total) || 0);
    }

    return {
      labels: labels,
      datasets: [{
        label: 'Ventas ($)',
        data: data,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 0.9)',
        pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2
      }]
    };
  }

  procesarDatosGrafico(): any {
    if (!this.datosVentas || this.datosVentas.length === 0) {
      return {
        labels: ['Sin datos'],
        datasets: [{
          label: 'Ventas',
          data: [0],
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2
        }]
      };
    }

    let labels: string[] = [];
    let data: number[] = [];

    if (this.periodoSeleccionado === 'anio') {
      // Para año, mostrar nombres de meses
      const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                           'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      // Crear array con todos los meses
      const mesesCompletos = Array.from({length: 12}, (_, i) => ({
        mes: i + 1,
        total: 0,
        cantidad: 0
      }));

      // Llenar con datos existentes
      this.datosVentas.forEach(dato => {
        const index = dato.mes - 1;
        if (index >= 0 && index < 12) {
          mesesCompletos[index].total = dato.total;
          mesesCompletos[index].cantidad = dato.cantidad;
        }
      });

      labels = nombresMeses;
      data = mesesCompletos.map(mes =>
        this.tipoReporteSeleccionado === 'ventas' ? parseFloat(mes.total.toString()) || 0 : parseInt(mes.cantidad.toString()) || 0
      );
    } else {
      // Para día y mes, usar fechas
      const datosOrdenados = [...this.datosVentas].reverse();

      labels = datosOrdenados.map(dato => {
        const fecha = new Date(dato.fecha);
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      });

      data = datosOrdenados.map(dato =>
        this.tipoReporteSeleccionado === 'ventas' ? parseFloat(dato.total) || 0 : parseInt(dato.cantidad) || 0
      );
    }

    return {
      labels: labels,
      datasets: [{
        label: this.tipoReporteSeleccionado === 'ventas' ? 'Ventas ($)' : 'Cantidad de prendas',
        data: data,
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',  // Lila con transparencia
          'rgba(59, 130, 246, 0.8)',  // Azul con transparencia
          'rgba(236, 72, 153, 0.8)', // Rosa con transparencia
          'rgba(168, 85, 247, 0.8)', // Lila claro con transparencia
          'rgba(96, 165, 250, 0.8)', // Azul cielo con transparencia
          'rgba(244, 114, 182, 0.8)', // Rosa vivo con transparencia
          'rgba(192, 132, 252, 0.8)', // Lila suave con transparencia
          'rgba(147, 197, 253, 0.8)'  // Azul suave con transparencia
        ].slice(0, labels.length),
        borderColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(244, 114, 182, 1)',
          'rgba(192, 132, 252, 1)',
          'rgba(147, 197, 253, 1)'
        ].slice(0, labels.length),
        hoverBorderWidth: 3,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  onPeriodoChange(): void {
    this.cargarDatos();
  }

  onTipoReporteChange(): void {
    this.inicializarGrafico();
  }

  formatearNumero(num: number): string {
    return num.toLocaleString('es-ES');
  }

  getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
  }

  getResumen(): { total: number; cantidad: number; promedio: number } {
    if (!this.datosVentas || this.datosVentas.length === 0) {
      return { total: 0, cantidad: 0, promedio: 0 };
    }

    const total = this.datosVentas.reduce((sum, item) => {
      const totalValue = parseFloat(item.total) || 0;
      return sum + totalValue;
    }, 0);

    const cantidad = this.datosVentas.reduce((sum, item) => {
      const cantidadValue = parseInt(item.cantidad) || 0;
      return sum + cantidadValue;
    }, 0);

    const promedio = cantidad > 0 ? total / cantidad : 0;

    return { total, cantidad, promedio };
  }
}
