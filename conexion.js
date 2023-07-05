const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000; // Puedes ajustar el número de puerto según tus necesidades

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
  });
  
  
  // Configuración de la conexión a MySQL
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '12345678',
    database: 'laboratorio15'
  });
  
  // Conexión a la base de datos
  connection.connect((error) => {
    if (error) {
      console.error('Error al conectar a MySQL: ', error);
      return;
    }
    console.log('Conexión exitosa a MySQL');
  });
  
  // Cerrar la conexión cuando sea necesario
  // connection.end();
  
  // Ejecutar una consulta SELECT
  connection.query('SELECT * FROM alumnos', (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta: ', error);
      return;
    }
    console.log('Resultados de la consulta: ', results);
  });
  

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Configurar Express.js para servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// Middleware para procesar datos enviados en formularios
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
    // Realizar consulta a la base de datos
    connection.query('SELECT * FROM alumnos', (error, resultados) => {
        if (error) {
        console.error('Error al obtener los datos: ', error);
        return;
        }
        // Renderizar la vista y pasar los resultados a través del objeto locals
        res.render('index', { datos: resultados });
    });
});
  

// Manejar la solicitud POST para agregar datos
app.post('/agregar', (req, res) => {
    const nombre_alumno = req.body.nombre_alumno;
    const ciclo_alumno = req.body.ciclo_alumno;
    const carrera_alumno = req.body.carrera_alumno;

    // Validación de datos
    if (nombre_alumno.trim() === '') {
        return res.status(400).send('El nombre del alumno es requerido');
    }
    if (!Number.isInteger(Number(ciclo_alumno)) || Number(ciclo_alumno) <= 0) {
        return res.status(400).send('El ciclo debe ser un número entero positivo');
    }
    if (carrera_alumno.length > 50) {
        return res.status(400).send('La carrera no debe exceder los 50 caracteres');
    }

    // Consulta SQL de inserción
    const consulta = 'INSERT INTO alumnos (nombre_alumno, ciclo_alumno, carrera_alumno) VALUES (?, ?, ?)';

    // Ejecutar la consulta de inserción
    connection.query(consulta, [nombre_alumno, ciclo_alumno, carrera_alumno], (error, results) => {
        if (error) {
            console.error('Error al insertar datos: ', error);
            return res.status(500).send('Error en el servidor');
        }
        console.log('Dato insertado exitosamente');
        res.redirect('/');
    });
});


// Manejar la solicitud POST para eliminar datos
app.post('/delete/:id_alumno', (req, res) => {
    const id_alumno = req.params.id_alumno;
    // Consulta SQL de eliminación
    const consulta = 'DELETE FROM alumnos WHERE id_alumno = ?';

    // Ejecutar la consulta de eliminación
    connection.query(consulta, [id_alumno], (error, results) => {
        if (error) {
            console.error('Error al eliminar datos: ', error);
            return;
        }
        console.log('Dato eliminado exitosamente');
        res.redirect('/');
    });
});

// Configurar Express.js para procesar datos enviados en formularios
app.use(express.urlencoded({ extended: true }));

// ...

// ...


app.get('/editar/:id', function(req, res) {
    // Recupera el ID del alumno desde req.params
    const alumnoId = req.params.id;
  
    // Realiza la consulta SQL para obtener los datos del alumno
    const sql = 'SELECT * FROM alumnos WHERE id_alumno = ?';
    connection.query(sql, [alumnoId], function(err, results) {
      if (err) {
        // Manejo de errores si ocurre algún problema durante la consulta SQL
        console.error('Error al obtener los datos del alumno:', err);
        // Redirige o muestra un mensaje de error al usuario, según corresponda
        res.redirect('/'); // Por ejemplo, redirige al inicio
      } else {
        // Comprueba si se encontraron resultados
        if (results.length === 0) {
          // No se encontraron datos del alumno para el ID proporcionado
          // Redirige o muestra un mensaje al usuario, según corresponda
          res.redirect('/'); // Por ejemplo, redirige al inicio
        } else {
          // Renderiza la plantilla editar.pug con los datos del alumno
          const alumno = results[0]; // Obtén el primer resultado de la consulta
          res.render('editar', { alumno });
        }
      }
    });
  });

// Manejar la solicitud POST para guardar cambios
app.post('/edit/:id_alumno', (req, res) => {
    const id_alumno = req.params.id_alumno;
    const nombre_alumno = req.body.nombre_alumno;
    const ciclo_alumno = req.body.ciclo_alumno;
    const carrera_alumno = req.body.carrera_alumno;

    // Validación de datos
    if (nombre_alumno.trim() === '') {
        return res.status(400).send('El nombre del alumno es requerido');
    }
    if (!Number.isInteger(Number(ciclo_alumno)) || Number(ciclo_alumno) <= 0) {
        return res.status(400).send('El ciclo debe ser un número entero positivo');
    }
    if (carrera_alumno.length > 50) {
        return res.status(400).send('La carrera no debe exceder los 50 caracteres');
    }
  
    // Consulta SQL de actualización
    const consulta = 'UPDATE alumnos SET nombre_alumno = ?, ciclo_alumno = ?, carrera_alumno = ? WHERE id_alumno = ?';
  
    // Ejecutar la consulta de actualización
    connection.query(consulta, [nombre_alumno, ciclo_alumno, carrera_alumno, id_alumno], (error, results) => {
      if (error) {
        console.error('Error al actualizar datos: ', error);
        return res.status(500).json({ error: 'Error al actualizar los datos del alumno' });
      }
      console.log('Dato actualizado exitosamente');
  
      // Redirigir a la página principal o a la vista de detalles del alumno
      res.redirect('/');
    });
  });











// ALUMNOS Y CURSOS

app.get('/alumnos-cursos', (req, res) => {
    const query = 'SELECT alumnos.id_alumno, alumnos.nombre_alumno, cursos.nombre_curso, cursos.descripcion_curso FROM alumnos JOIN cursos ON alumnos.id_alumno = cursos.alumno_id';
    connection.query(query, (error, results) => {
        if (error) {
        console.error('Error al ejecutar la consulta: ', error);
        return res.status(500).send('Error en el servidor');
        }
        res.render('alumnos-cursos', { datos: results });
    });
});
  
// Ruta para editar un alumno-curso
app.get('/editar/alumno-curso/:id', (req, res) => {
    const idAlumno = req.params.id;
  
    // Consulta para obtener los datos del alumno y curso correspondiente al idAlumno utilizando JOIN y WHERE
    const query = 'SELECT alumnos.nombre_alumno, cursos.nombre_curso, cursos.descripcion_curso FROM alumnos JOIN cursos ON alumnos.id_alumno = cursos.alumno_id WHERE alumnos.id_alumno = ?';
    connection.query(query, [idAlumno], (error, result) => {
      if (error) {
        console.error('Error al obtener los datos del alumno-curso: ', error);
        return res.status(500).send('Error en el servidor');
      }
  
      // Verifica si se encontraron datos
      if (result.length === 0) {
        return res.status(404).send('Alumno-curso no encontrado');
      }
  
      const alumnoCurso = result[0]; // Obtiene el alumno-curso encontrado
  
      // Renderiza la vista de edición (editar-alumno-curso.pug) y pasa los datos del alumno-curso como contexto
      res.render('editar-alumno-curso', { alumnoCurso: alumnoCurso }); // Asegúrate de pasar el objeto alumnoCurso correctamente
    });
  });
  
  
app.post('/delete/alumno-curso/:id', (req, res) => {
    const idAlumno = req.params.id;
  
    // Primero, eliminar los cursos asociados al alumno
    const deleteCursosQuery = 'DELETE FROM cursos WHERE alumno_id = ?';
    connection.query(deleteCursosQuery, [idAlumno], (error, result) => {
      if (error) {
        console.error('Error al eliminar los cursos asociados al alumno: ', error);
        return res.status(500).send('Error en el servidor');
      }
  
      // Luego, eliminar al alumno
      const deleteAlumnoQuery = 'DELETE FROM alumnos WHERE id_alumno = ?';
      connection.query(deleteAlumnoQuery, [idAlumno], (error, result) => {
        if (error) {
          console.error('Error al eliminar el alumno: ', error);
          return res.status(500).send('Error en el servidor');
        }
  
        // Lógica adicional después de eliminar el alumno y los cursos (si es necesario)
  
        res.redirect('/alumnos-cursos'); // Redirecciona a la página de alumnos-cursos después de eliminar
      });
    });
});

// Manejar la solicitud POST para actualizar un alumno-curso
app.post('/editar/alumno-curso/:id_alumno', (req, res) => {
  const idAlumno = req.params.id;
  const nombreAlumno = req.body.nombre_alumno;
  const nombreCurso = req.body.nombre_curso;
  const descripcionCurso = req.body.descripcion_curso;

  // Consulta SQL de actualización
  const updateQuery = 'UPDATE alumnos JOIN cursos ON alumnos.id_alumno = cursos.alumno_id SET alumnos.nombre_alumno = ?, cursos.nombre_curso = ?, cursos.descripcion_curso = ? WHERE alumnos.id_alumno = ?';

  // Ejecutar la consulta de actualización
  connection.query(updateQuery, [nombreAlumno, nombreCurso, descripcionCurso, idAlumno], (error, results) => {
    if (error) {
      console.error('Error al actualizar datos del alumno-curso: ', error);
      return res.status(500).send('Error en el servidor');
    }
    console.log('Datos del alumno-curso actualizados exitosamente');

    // Redirigir a la página de alumnos-cursos o a la vista de detalles del alumno-curso actualizado
    res.redirect('/alumnos-cursos');
  });
});
