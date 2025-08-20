#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

class GitFlowDemo {
    constructor() {
        this.demoSteps = [
            {
                title: "🚀 Demo: GitFlow Automation System",
                description: "Simulando tu flujo de trabajo completo"
            },
            {
                title: "1️⃣ Feature Development",
                commands: [
                    "git checkout -b add/forms-deposit",
                    "echo '// Formulario de depósito' > deposit-form.js",
                    "git add deposit-form.js",
                    "git commit -m 'feat: agregar formulario de depósito'",
                    "echo '// Validaciones' >> deposit-form.js",
                    "git add deposit-form.js",
                    "git commit -m 'feat: agregar validaciones de formulario'"
                ]
            },
            {
                title: "2️⃣ Merge a Development",
                commands: [
                    "git checkout development",
                    "git merge add/forms-deposit",
                    "git push origin development"
                ]
            },
            {
                title: "3️⃣ Crear Release Branch",
                commands: [
                    "git checkout -b release/1.1.0",
                    "git push origin release/1.1.0"
                ]
            },
            {
                title: "4️⃣ Hotfix durante QA",
                commands: [
                    "git checkout -b hotfix/styles-deposit",
                    "echo '/* Estilos corregidos */' > styles.css",
                    "git add styles.css",
                    "git commit -m 'fix: corregir estilos del formulario'",
                    "git checkout release/1.1.0",
                    "git merge hotfix/styles-deposit"
                ]
            },
            {
                title: "5️⃣ Final Release",
                commands: [
                    "git checkout master",
                    "git merge release/1.1.0",
                    "git push origin master"
                ]
            }
        ];
    }

    async runDemo() {
        console.log('\n🎬 INICIANDO DEMO DEL SISTEMA GITFLOW\n');
        console.log('=' .repeat(60));
        
        for (let i = 0; i < this.demoSteps.length; i++) {
            const step = this.demoSteps[i];
            
            console.log(`\n${step.title}`);
            console.log('-'.repeat(step.title.length));
            
            if (step.description) {
                console.log(step.description);
                console.log('');
                continue;
            }

            if (step.commands) {
                for (const command of step.commands) {
                    console.log(`🔄 Ejecutando: ${command}`);
                    
                    try {
                        if (command.startsWith('echo')) {
                            // Simular echo command
                            const content = command.match(/echo '(.+)' > (.+)/);
                            if (content) {
                                fs.writeFileSync(content[2], content[1]);
                                console.log(`✅ Archivo creado: ${content[2]}`);
                            } else {
                                const append = command.match(/echo '(.+)' >> (.+)/);
                                if (append) {
                                    fs.appendFileSync(append[2], append[1] + '\n');
                                    console.log(`✅ Contenido agregado a: ${append[2]}`);
                                }
                            }
                        } else {
                            execSync(command, { stdio: 'inherit' });
                        }
                        
                        console.log(`✅ Comando exitoso`);
                        
                    } catch (error) {
                        console.log(`⚠️  Comando simulado (demo)`);
                    }
                    
                    console.log('');
                }
            }

            // Pausa entre pasos
            if (i < this.demoSteps.length - 1) {
                console.log('⏳ Esperando 2 segundos...\n');
                await this.sleep(2000);
            }
        }

        console.log('=' .repeat(60));
        console.log('\n🎉 DEMO COMPLETADO');
        console.log('\n📋 Resumen de lo que se simularía:');
        console.log('• Tags Alpha creados en development');
        console.log('• Tags Beta creados en release');
        console.log('• Tags RC creados en hotfixes');
        console.log('• Tags finales creados en master');
        console.log('\n📖 Revisa scripts/README.md para más detalles');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Ejecutar demo
const demo = new GitFlowDemo();
demo.runDemo().catch(console.error);
